"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearEnrichmentContext,
  loadEnrichmentContext,
  saveEnrichmentContext,
  EnrichmentContext,
  EnrichmentStatusEntry,
} from "@/lib/extraction-context";

const pipelineSteps = ["Ingestion", "Extraction", "Cleansing", "Data Enrichment", "Content QA"];

const canonicalizeStatus = (value?: string) =>
  value ? value.replace(/\s+/g, "_").toUpperCase() : "";

const statusLabel = (value?: string) => {
  const canonical = canonicalizeStatus(value);
  switch (canonical) {
    case "CLEANSED_PENDING_ENRICHMENT":
      return "Cleansed • awaiting enrichment";
    case "ENRICHMENT_REQUESTED":
      return "Enrichment requested";
    case "ENRICHMENT_IN_PROGRESS":
      return "Enrichment in progress";
    case "ENRICHMENT_COMPLETE":
      return "Enrichment complete";
    case "NOT_FOUND":
      return "Record not found";
    default:
      return value || "Unknown";
  }
};

const timelineLabels = [
  { key: "CLEANSED_PENDING_ENRICHMENT", label: "Cleansed" },
  { key: "ENRICHMENT_REQUESTED", label: "Enrichment requested" },
  { key: "ENRICHMENT_IN_PROGRESS", label: "Enrichment running" },
  { key: "ENRICHMENT_COMPLETE", label: "Enrichment complete" },
];

export default function EnrichmentPage() {
  const router = useRouter();
  const [context, setContext] = useState<EnrichmentContext | null>(loadEnrichmentContext());
  const contextRef = useRef(context);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    if (!context) {
      router.replace("/cleansed");
    }
  }, [context, router]);

  const history = context?.statusHistory ?? [
    {
      status: context?.metadata.status ?? "ENRICHMENT_REQUESTED",
      timestamp: context?.startedAt ?? Date.now(),
    },
  ];

  const canonicalStatus = canonicalizeStatus(context?.metadata.status);
  const items = context?.items ?? [];

  const updateContext = useCallback(
    (updater: (prev: EnrichmentContext) => EnrichmentContext) => {
      setContext((previous) => {
        if (!previous) return previous;
        const next = updater(previous);
        saveEnrichmentContext(next);
        return next;
      });
    },
    [],
  );

  const appendHistory = useCallback(
    (entry: EnrichmentStatusEntry) => {
      if (!contextRef.current) return;
      updateContext((prev) => {
        const prevHistory = prev.statusHistory ?? [];
        const alreadyRecorded = prevHistory.some(
          (record) => canonicalizeStatus(record.status) === canonicalizeStatus(entry.status),
        );
        const nextHistory = alreadyRecorded ? prevHistory : [...prevHistory, entry];
        return {
          ...prev,
          metadata: { ...prev.metadata, status: entry.status },
          statusHistory: nextHistory,
        };
      });
    },
    [updateContext],
  );

  const refreshStatus = useCallback(
    async (silent = false) => {
      const current = contextRef.current;
      if (!current?.metadata.cleansedId) {
        return;
      }
      if (!silent) {
        setPolling(true);
        setError(null);
      }
      try {
        const response = await fetch(
          `/api/ingestion/status?id=${encodeURIComponent(current.metadata.cleansedId)}`,
        );
        const payload = await response.json();
        const rawStatus =
          typeof payload.status === "string"
            ? payload.status
            : typeof payload.body === "string"
              ? payload.body
              : typeof payload.rawBody === "string"
                ? payload.rawBody
                : "";
        if (rawStatus) {
          appendHistory({ status: rawStatus, timestamp: Date.now() });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch enrichment status.");
      } finally {
        if (!silent) {
          setPolling(false);
        }
      }
    },
    [appendHistory],
  );

  useEffect(() => {
    if (!context?.metadata.cleansedId) return;
    refreshStatus(true);
    if (canonicalStatus === "ENRICHMENT_COMPLETE") return;

    const interval = setInterval(() => {
      refreshStatus(true);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [context?.metadata.cleansedId, canonicalStatus, refreshStatus]);

  const handleReset = () => {
    clearEnrichmentContext();
    router.push("/cleansed");
  };

  if (!context) {
    return null;
  }

  const currentStatusLabel = statusLabel(context.metadata.status);
  const timeline = history.length
    ? history
    : [
        {
          status: context.metadata.status ?? "ENRICHMENT_REQUESTED",
          timestamp: context.startedAt,
        },
      ];

  const completedSteps = new Set(
    timeline.map((entry) => canonicalizeStatus(entry.status)),
  );

  const pipelineIndex = 3; // Data Enrichment

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Enrichment</p>
              <h1 className="text-xl font-semibold text-slate-900">
                Track enrichment progress
              </h1>
            </div>
            <FeedbackPill
              feedback={
                error
                  ? { state: "error", message: error }
                  : polling
                    ? { state: "loading", message: "Checking status..." }
                    : { state: "idle" }
              }
            />
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            {pipelineSteps.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "rounded-full px-3 py-1",
                    index < pipelineIndex
                      ? "bg-slate-900 text-white"
                      : index === pipelineIndex
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {label}
                </span>
                {index < pipelineSteps.length - 1 && (
                  <span className="text-slate-300">—</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
              <h2 className="text-lg font-semibold text-slate-900">Current status</h2>
              <p className="mt-1 text-sm text-slate-600">{currentStatusLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => refreshStatus(false)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
              >
                <ArrowPathIcon
                  className={clsx("size-4", polling && "animate-spin text-indigo-600")}
                />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-rose-200 hover:text-rose-700"
              >
                Reset
              </button>
            </div>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Cleansed ID
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.metadata.cleansedId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Source</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.metadata.source}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Items to enrich
              </dt>
              <dd className="text-sm font-semibold text-slate-900">{items.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Started at
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {new Date(context.startedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Timeline</p>
              <h3 className="text-lg font-semibold text-slate-900">Status history</h3>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {timeline.map((entry, index) => {
              const canonical = canonicalizeStatus(entry.status);
              const isComplete = canonical === "ENRICHMENT_COMPLETE";
              return (
                <div
                  key={`${entry.status}-${entry.timestamp}-${index}`}
                  className="flex items-start gap-4"
                >
                  <span
                    className={clsx(
                      "mt-1 inline-flex size-8 items-center justify-center rounded-full border",
                      isComplete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : canonical === canonicalStatus
                          ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                          : "border-slate-200 bg-white text-slate-400",
                    )}
                  >
                    {isComplete ? (
                      <CheckCircleIcon className="size-4" />
                    ) : canonical === canonicalStatus ? (
                      <ArrowPathIcon className="size-4 animate-spin" />
                    ) : (
                      <ChevronRightIcon className="size-4" />
                    )}
                  </span>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">
                      {statusLabel(entry.status)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Enriched items ({items.length})
            </h3>
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search enriched snippets..."
                onChange={() => {}}
                disabled
                className="w-full cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-400"
              />
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
              Enrichment results will appear here once available.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item, index) => (
                <EnrichedCard key={index} item={item} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

type EnrichedCardProps = {
  item: unknown;
  index: number;
};

const EnrichedCard = ({ item, index }: EnrichedCardProps) => {
  const record = (item ?? {}) as Record<string, any>;
  const facets = (record.context?.facets ?? {}) as Record<string, unknown>;
  const enrichedText =
    record.enrichedContent ??
    record.cleansedContent ??
    facets.cleansedCopy ??
    record.value ??
    "—";

  const tags = extractTags(record);

  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Enriched field
          </p>
          <h4 className="text-sm font-semibold text-slate-900">
            {record.originalFieldName ?? record.itemType ?? `Entry ${index + 1}`}
          </h4>
          <p className="text-xs text-slate-500">
            {record.usagePath ?? record.context?.usagePath ?? record.sourcePath ?? "—"}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          #{index + 1}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Enriched content
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{enrichedText}</p>
      </div>

      {tags.length > 0 && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

const extractTags = (record: Record<string, any>): string[] => {
  const tags = new Set<string>();
  const facets = (record.context?.facets ?? {}) as Record<string, unknown>;
  const candidates: unknown[] = [
    record.tags,
    facets.tags,
    facets.analyticsTags,
    facets.analyticsTag,
    facets.topic,
    facets.sectionKey,
    facets.eventType,
    record.itemType,
  ];

  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) {
      candidate.forEach((entry) => {
        if (entry) {
          tags.add(String(entry));
        }
      });
    } else if (typeof candidate === "string") {
      candidate
        .split(/[,|]/)
        .map((segment) => segment.trim())
        .filter(Boolean)
        .forEach((segment) => tags.add(segment));
    }
  });

  return Array.from(tags).slice(0, 8);
};