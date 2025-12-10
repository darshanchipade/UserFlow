"use client";

import {
  ArrowPathIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { PipelineShell } from "@/components/PipelineShell";
import { StageHero } from "@/components/StageHero";

const HISTORY_KEY = "content-lake.search-history.v1";
const MAX_HISTORY = 6;

type SearchResult = {
  id?: string;
  title: string;
  snippet?: string;
  score?: number;
  source?: string;
  payload: Record<string, unknown>;
};

type SearchResponsePayload = {
  hits: SearchResult[];
  total?: number;
  raw?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
};

const mapResult = (record: Record<string, unknown>, index: number): SearchResult => {
  const title =
    (record.title as string) ??
    (record.name as string) ??
    (record.headline as string) ??
    (record.label as string) ??
    `Result ${index + 1}`;
  const snippet =
    (record.snippet as string) ??
    (record.summary as string) ??
    (record.description as string) ??
    (record.excerpt as string) ??
    undefined;
  const score = typeof record.score === "number" ? record.score : (record._score as number | undefined);
  const source =
    (record.source as string) ??
    (record.sourceType as string) ??
    (record.origin as string) ??
    (record.channel as string) ??
    undefined;
  return {
    id: (record.id as string) ?? (record._id as string) ?? record.hash?.toString(),
    title,
    snippet,
    score,
    source,
    payload: record,
  };
};

const normalizeSearchPayload = (payload: unknown): SearchResponsePayload => {
  if (!payload) return { hits: [], raw: payload };
  const root = (payload as Record<string, unknown>) ?? {};
  const possibleCollections = [
    (root.results as unknown) ?? null,
    (root.hits as unknown) ?? null,
    (root.items as unknown) ?? null,
    (root.data as unknown) ?? null,
  ].filter(Boolean);
  const collectionCandidate = possibleCollections.find(Array.isArray) ?? (Array.isArray(payload) ? payload : null);
  if (!collectionCandidate || !Array.isArray(collectionCandidate)) {
    return { hits: [], raw: payload };
  }
  const mapped = collectionCandidate
    .filter(isRecord)
    .map((record, index) => mapResult(record, index));
  const total =
    (typeof root.total === "number" && root.total) ||
    (typeof root.count === "number" && root.count) ||
    (typeof root.numFound === "number" && root.numFound) ||
    undefined;
  return { hits: mapped, total, raw: payload };
};

const readHistory = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string").slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
};

const writeHistory = (history: string[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [sourceType, setSourceType] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRunMeta, setLastRunMeta] = useState<{ query: string; total?: number; tookMs?: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);

  useEffect(() => {
    const stored = readHistory();
    setHistory(stored);
    setHistoryHydrated(true);
  }, []);

  useEffect(() => {
    if (!historyHydrated) return;
    writeHistory(history);
  }, [history, historyHydrated]);

  const handleSearch = async (incomingQuery?: string) => {
    const finalQuery = (incomingQuery ?? query).trim();
    if (!finalQuery) {
      setError("Enter a search query first.");
      return;
    }
    setError(null);
    setLoading(true);
    setRawResponse(null);
    const started = performance.now();
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: finalQuery,
          filters: sourceType === "all" ? undefined : { sourceType },
          limit,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Search request failed.");
      }
      const normalized = normalizeSearchPayload(payload.body ?? payload);
      setResults(normalized.hits);
      setRawResponse(JSON.stringify(payload.body ?? payload, null, 2));
      setLastRunMeta({
        query: finalQuery,
        total: normalized.total ?? normalized.hits.length,
        tookMs: Math.round(performance.now() - started),
      });
      setHistory((previous) => {
        const next = [finalQuery, ...previous.filter((entry) => entry !== finalQuery)];
        return next.slice(0, MAX_HISTORY);
      });
    } catch (searchError) {
      setResults([]);
      setRawResponse(null);
      setLastRunMeta(null);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Unable to complete the search right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const metaDescription = useMemo(() => {
    if (!lastRunMeta) return null;
    const pieces = [];
    if (typeof lastRunMeta.total === "number") {
      pieces.push(`${lastRunMeta.total} results`);
    }
    if (typeof lastRunMeta.tookMs === "number") {
      pieces.push(`${lastRunMeta.tookMs} ms`);
    }
    return pieces.join(" · ");
  }, [lastRunMeta]);

  return (
    <PipelineShell currentStep="ingestion">
      <StageHero
        title="Search Finder"
        description="Query Content Lake with semantic, keyword, or hybrid searches wired straight into Spring Boot."
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Search workspace</p>
                <h2 className="text-lg font-semibold text-slate-900">Send a query</h2>
              </div>
              {metaDescription && (
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <ClockIcon className="size-4 text-slate-500" />
                  {metaDescription}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <label htmlFor="query" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Query
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400" />
                    <input
                      id="query"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Try “Vision Pro announcement site copy”"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Results
                    <select
                      value={limit}
                      onChange={(event) => setLimit(Number(event.target.value))}
                      className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      {[5, 10, 25, 50].map((value) => (
                        <option key={value} value={value}>
                          Top {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Source
                    <select
                      value={sourceType}
                      onChange={(event) => setSourceType(event.target.value)}
                      className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="all">All</option>
                      <option value="web">Web</option>
                      <option value="cms">CMS</option>
                      <option value="knowledge">Knowledge</option>
                      <option value="product">Product</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black",
                    loading && "cursor-not-allowed opacity-60",
                  )}
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="size-4 animate-spin" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="size-4" />
                      Run search
                    </>
                  )}
                </button>
                {history.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Recent:</span>
                    {history.map((entry) => (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => handleSearch(entry)}
                        className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
                      >
                        {entry}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {error && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  <ExclamationCircleIcon className="size-4" />
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Results</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {lastRunMeta ? `Showing results for “${lastRunMeta.query}”` : "No query yet"}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {results.length ? `${results.length} matches displayed` : "—"}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {!results.length && !loading && (
              <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                Run a search to see ranked matches from Content Lake.
              </div>
            )}
            {results.map((result) => (
              <article key={result.id ?? result.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{result.title}</h3>
                    {result.source && (
                      <p className="text-xs uppercase tracking-wide text-slate-400">{result.source}</p>
                    )}
                  </div>
                  {result.score !== undefined && (
                    <span className="text-xs font-semibold text-slate-500">Score {result.score.toFixed(3)}</span>
                  )}
                </div>
                {result.snippet && (
                  <p className="mt-3 text-sm text-slate-700">{result.snippet}</p>
                )}
                <details className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    View raw fields
                  </summary>
                  <pre className="mt-3 max-h-64 overflow-y-auto text-xs text-slate-600">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                </details>
              </article>
            ))}
          </div>
          {rawResponse && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Raw response</p>
              <pre className="mt-2 max-h-64 overflow-y-auto text-xs text-slate-700">{rawResponse}</pre>
            </div>
          )}
        </section>
      </main>
    </PipelineShell>
  );
}
