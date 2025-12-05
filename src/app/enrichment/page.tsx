"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadEnrichmentContext,
  saveEnrichmentContext,
  clearEnrichmentContext,
  type EnrichmentContext,
} from "@/lib/extraction-context";
import { PipelineTracker } from "@/components/PipelineTracker";

type Feedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

type SummaryFeedback = {
  state: "idle" | "loading" | "error";
  message?: string;
};

const STATUS_LABELS: Record<string, string> = {
  ENRICHMENT_TRIGGERED: "Queued for enrichment",
  WAITING_FOR_RESULTS: "Awaiting AI output",
  ENRICHMENT_RUNNING: "Enrichment running",
  PARTIALLY_ENRICHED: "Partially enriched",
  ENRICHMENT_COMPLETE: "Enrichment complete",
  ERROR: "Failed",
};

const STATUS_COLORS: Record<
  string,
  { className: string; dot: string; background: string }
> = {
  ENRICHMENT_TRIGGERED: {
    className: "text-indigo-700",
    dot: "bg-indigo-400",
    background: "bg-indigo-50",
  },
  WAITING_FOR_RESULTS: {
    className: "text-amber-700",
    dot: "bg-amber-400",
    background: "bg-amber-50",
  },
  ENRICHMENT_RUNNING: {
    className: "text-sky-700",
    dot: "bg-sky-400",
    background: "bg-sky-50",
  },
  ENRICHMENT_COMPLETE: {
    className: "text-emerald-700",
    dot: "bg-emerald-500",
    background: "bg-emerald-50",
  },
  PARTIALLY_ENRICHED: {
    className: "text-sky-700",
    dot: "bg-sky-400",
    background: "bg-sky-50",
  },
  ERROR: {
    className: "text-rose-700",
    dot: "bg-rose-400",
    background: "bg-rose-50",
  },
};

const FALLBACK_HISTORY = [
  { status: "ENRICHMENT_TRIGGERED", timestamp: Date.now() },
  { status: "WAITING_FOR_RESULTS", timestamp: Date.now() },
] satisfies EnrichmentContext["statusHistory"];

export default function EnrichmentPage() {
  const router = useRouter();
  const [context, setContext] = useState<EnrichmentContext | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<Feedback>({ state: "idle" });
  const [summaryFeedback, setSummaryFeedback] = useState<SummaryFeedback>({ state: "idle" });
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    setContext(loadEnrichmentContext());
  }, []);

  const statusHistory = context?.statusHistory?.length
    ? context.statusHistory
    : FALLBACK_HISTORY;
  const currentStatus = statusHistory[statusHistory.length - 1]?.status ?? "WAITING_FOR_RESULTS";
  const statusMeta = STATUS_COLORS[currentStatus] ?? {
    className: "text-slate-700",
    dot: "bg-slate-300",
    background: "bg-slate-100",
  };

  const progress = useMemo(() => {
    const statuses = [
      "ENRICHMENT_TRIGGERED",
      "WAITING_FOR_RESULTS",
      "ENRICHMENT_RUNNING",
      "PARTIALLY_ENRICHED",
      "ENRICHMENT_COMPLETE",
    ];
    const index = statuses.findIndex((status) => status === currentStatus);
    if (index >= 0) {
      return ((index + 1) / statuses.length) * 100;
    }
    const derivedIndex = Math.min(statusHistory.length, statuses.length);
    return (derivedIndex / statuses.length) * 100;
  }, [currentStatus, statusHistory.length]);

  const handleRefreshStatus = async () => {
    if (!context?.metadata.cleansedId) {
      setStatusFeedback({
        state: "error",
        message: "Cleansed ID missing; re-run cleansing before enrichment.",
      });
      return;
    }
    setStatusFeedback({ state: "loading" });
    try {
      const response = await fetch(
        `/api/ingestion/status?id=${encodeURIComponent(context.metadata.cleansedId)}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        setStatusFeedback({
          state: "error",
          message: payload?.error ?? "Backend rejected the status request.",
        });
        return;
      }

      const nextStatus =
        typeof payload?.body === "string"
          ? payload.body
          : typeof payload?.status === "string"
            ? payload.status
            : currentStatus;

      const nextHistory =
        context.statusHistory?.[context.statusHistory.length - 1]?.status === nextStatus
          ? context.statusHistory
          : [
              ...(context.statusHistory ?? []),
              { status: nextStatus, timestamp: Date.now() },
            ];

      const nextContext: EnrichmentContext = {
        ...context,
        statusHistory: nextHistory,
      };
      saveEnrichmentContext(nextContext);
      setContext(nextContext);
      setStatusFeedback({ state: "success", message: "Status refreshed." });
      await fetchSummary(false);
    } catch (error) {
      setStatusFeedback({
        state: "error",
        message: error instanceof Error ? error.message : "Unable to refresh status.",
      });
    }
  };

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Enrichment</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Enrichment data not found
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            Trigger enrichment from the cleansing screen to review progress here.
          </p>
          <button
            type="button"
            onClick={() => router.push("/cleansing")}
            className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
          >
            Back to Cleansing
          </button>
        </div>
      </div>
    );
  }

  const extractSummary = (body: unknown): string => {
    if (typeof body === "string") return body;
    if (body && typeof body === "object") {
      const source = body as Record<string, unknown>;
      const summaryKeys = ["summary", "aiSummary", "insights", "result", "text", "content"];
      for (const key of summaryKeys) {
        const candidate = source[key];
        if (typeof candidate === "string" && candidate.trim()) {
          return candidate;
        }
      }
      return JSON.stringify(source, null, 2);
    }
    return "Awaiting enrichment results.";
  };

  const fetchSummary = async (showLoading = true) => {
    if (!context?.metadata.cleansedId) return;
    if (showLoading) {
      setSummaryFeedback({ state: "loading" });
    }
    try {
      const response = await fetch(
        `/api/ingestion/enrichment/result?id=${encodeURIComponent(
          context.metadata.cleansedId,
        )}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        setSummaryFeedback({
          state: "error",
          message: payload?.error ?? "Backend rejected the enrichment result request.",
        });
        return;
      }
      setSummary(extractSummary(payload?.body ?? payload));
      setSummaryFeedback({ state: "idle" });
    } catch (error) {
      setSummaryFeedback({
        state: "error",
        message:
          error instanceof Error ? error.message : "Unable to load enrichment results.",
      });
    }
  };

  useEffect(() => {
    if (context?.metadata.cleansedId) {
      fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.metadata.cleansedId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Enrichment</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Monitor enrichment for {context.metadata.name}
            </h1>
          </div>
          <div className="flex flex-1 flex-col items-start gap-3 md:flex-row md:items-center md:justify-end">
            <PipelineTracker current="enrichment" />
            {statusFeedback.state !== "idle" && (
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  statusFeedback.state === "loading"
                    ? "bg-indigo-50 text-indigo-600"
                    : statusFeedback.state === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {statusFeedback.message ??
                  (statusFeedback.state === "loading"
                    ? "Refreshing status…"
                    : statusFeedback.state === "success"
                      ? "Status updated."
                      : "Unable to refresh status.")}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Current status</p>
              <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusMeta.background} ${statusMeta.className}`}>
                <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
                {STATUS_LABELS[currentStatus] ?? currentStatus}
              </div>
            </div>
            <div className="w-full max-w-md">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Pipeline progress
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{Math.round(progress)}% complete</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshStatus}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Refresh Status
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cleansed ID</p>
              <p className="text-sm font-semibold text-slate-900">
                {context.metadata.cleansedId ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Source</p>
              <p className="text-sm font-semibold text-slate-900">{context.metadata.source}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Started at</p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(context.startedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Last update</p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(
                  statusHistory[statusHistory.length - 1]?.timestamp ?? context.startedAt,
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Status timeline</p>
          <h2 className="text-lg font-semibold text-slate-900">Pipeline events</h2>
          <div className="mt-4 space-y-4 border-l border-slate-200 pl-6">
            {statusHistory.map((entry) => {
              const meta = STATUS_COLORS[entry.status] ?? {
                className: "text-slate-700",
                dot: "bg-slate-300",
              };
              return (
                <div key={`${entry.status}-${entry.timestamp}`} className="relative">
                  <span
                    className={`absolute -left-[33px] mt-1 inline-flex h-3 w-3 rounded-full ${meta.dot}`}
                  />
                  <p className={`text-sm font-semibold ${meta.className}`}>
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Insights</p>
              <h2 className="text-lg font-semibold text-slate-900">AI summary preview</h2>
            </div>
            <span className="text-xs text-slate-500">
              Read-only snapshot of the most recent enrichment output.
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            {summaryFeedback.state === "loading" ? (
              <p>Loading enrichment summary…</p>
            ) : summaryFeedback.state === "error" ? (
              <div>
                <p className="font-semibold text-amber-700">Unable to load enrichment summary.</p>
                <p className="text-xs text-slate-600">{summaryFeedback.message}</p>
                <button
                  type="button"
                  onClick={() => fetchSummary(true)}
                  className="mt-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            ) : summary ? (
              <pre className="whitespace-pre-wrap text-sm text-slate-800">{summary}</pre>
            ) : (
              <p>
                Awaiting enrichment results. Once the backend finishes generating AI insights,
                they’ll appear here automatically. Use the “Refresh status” button above to check
                for updates.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Next steps</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Wrap up or keep monitoring
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/cleansing")}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Back to Cleansing
              </button>
              <button
                type="button"
                onClick={handleRefreshStatus}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Refresh Status
              </button>
              <button
                type="button"
                onClick={() => {
                  clearEnrichmentContext();
                  router.push("/ingestion");
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Finish Session
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
