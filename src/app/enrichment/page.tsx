"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearEnrichmentContext,
  loadEnrichmentContext,
  type EnrichmentContext,
} from "@/lib/extraction-context";
import { PipelineTracker } from "@/components/PipelineTracker";
import { describeSourceLabel, inferSourceType, pickString } from "@/lib/source";

type Feedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

type SummaryFeedback = {
  state: "idle" | "loading" | "error";
  message?: string;
};

type EnrichmentDetailRow = {
  id: string;
  cleansedItem: string;
  summary?: string;
  tags: string[];
  sentiments: string[];
};

type RemoteEnrichmentContext = {
  metadata: EnrichmentContext["metadata"];
  startedAt: number;
  statusHistory: { status: string; timestamp: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  ENRICHMENT_TRIGGERED: "Queued for enrichment",
  WAITING_FOR_RESULTS: "Awaiting AI output",
  ENRICHMENT_RUNNING: "Enrichment running",
  PARTIALLY_ENRICHED: "Partially enriched",
  ENRICHMENT_COMPLETE: "Enrichment complete",
  ERROR: "Failed",
};

const STATUS_COLORS: Record<string, { className: string; dot: string; background: string }> = {
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

const FALLBACK_HISTORY: EnrichmentContext["statusHistory"] = [
  { status: "ENRICHMENT_TRIGGERED", timestamp: 0 },
  { status: "WAITING_FOR_RESULTS", timestamp: 0 },
];

const parseJson = async (response: Response) => {
  const rawBody = await response.text();
  const trimmed = rawBody.trim();
  let body: unknown = null;
  if (trimmed.length) {
    try {
      body = JSON.parse(trimmed);
    } catch {
      body = null;
    }
  }
  const looksLikeHtml = trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html");
  const friendlyRaw =
    looksLikeHtml && response.status
      ? `${response.status} ${response.statusText || ""}`.trim() || "HTML response returned."
      : rawBody;
  return { body, rawBody: friendlyRaw };
};

const pickNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
};

const formatTimestamp = (value?: number | null) => {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleString();
};

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : undefined))
      .filter((entry): entry is string => Boolean(entry && entry.length));
  }
  if (typeof value === "string" && value.trim().length) {
    return value
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeProxyDetails = (payload: unknown): EnrichmentDetailRow[] => {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const cleansedItem =
        pickString(record.cleansedItem) ??
        pickString(record.cleansedContent) ??
        pickString(record.item) ??
        pickString(record.field) ??
        pickString(record.label) ??
        `Item ${index + 1}`;
      const summary =
        pickString(record.summary) ??
        pickString(record.aiSummary) ??
        pickString(record.description) ??
        pickString(record.content);
      const tags = toStringArray(record.tags);
      const sentiments = toStringArray(record.sentiments);
      return {
        id:
          pickString(record.id) ??
          pickString(record.cleansedId) ??
          `enrichment-${index}`,
        cleansedItem,
        summary: summary ?? undefined,
        tags,
        sentiments,
      };
    })
    .filter((row): row is EnrichmentDetailRow => Boolean(row));
};

const buildSummaryFromDetails = (details: EnrichmentDetailRow[]): string | undefined => {
  if (!details.length) {
    return undefined;
  }
  return details
    .map((detail) => {
      const summaryLine = detail.summary ?? "Awaiting summary.";
      const tagsLine = detail.tags.length ? `Tags: ${detail.tags.join(", ")}` : null;
      const sentimentsLine = detail.sentiments.length
        ? `Sentiments: ${detail.sentiments.join(", ")}`
        : null;
      return [`${detail.cleansedItem}: ${summaryLine}`, tagsLine, sentimentsLine]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
};

const buildDefaultMetadata = (
  id: string,
  fallback?: EnrichmentContext["metadata"],
): EnrichmentContext["metadata"] => {
  return (
    fallback ?? {
      name: "Unknown dataset",
      size: 0,
      source: "Unknown source",
      uploadedAt: Date.now(),
      cleansedId: id,
    }
  );
};

const buildMetadataFromBackend = (
  backend: Record<string, unknown> | null,
  fallback: EnrichmentContext["metadata"],
  id: string,
): EnrichmentContext["metadata"] => {
  if (!backend) return fallback;
  const metadataRecord =
    backend.metadata && typeof backend.metadata === "object"
      ? (backend.metadata as Record<string, unknown>)
      : null;
  const next: EnrichmentContext["metadata"] = { ...fallback };
  if (metadataRecord) {
    next.name = pickString(metadataRecord.name) ?? next.name;
    next.source = pickString(metadataRecord.source) ?? next.source;
    next.cleansedId = pickString(metadataRecord.cleansedId) ?? next.cleansedId;
    next.sourceIdentifier =
      pickString(metadataRecord.sourceIdentifier) ?? next.sourceIdentifier;
    next.sourceType = pickString(metadataRecord.sourceType) ?? next.sourceType;
    const uploadedCandidate = pickNumber(metadataRecord.uploadedAt);
    if (uploadedCandidate) {
      next.uploadedAt = uploadedCandidate;
    }
    const sizeCandidate = pickNumber(metadataRecord.size);
    if (sizeCandidate !== undefined) {
      next.size = sizeCandidate;
    }
  }
  const derivedIdentifier =
    pickString(backend.sourceIdentifier) ??
    pickString(backend.sourceUri) ??
    next.sourceIdentifier;
  const derivedType =
    inferSourceType(
      pickString(backend.sourceType),
      derivedIdentifier ?? next.sourceIdentifier,
      next.sourceType,
    ) ?? next.sourceType;
  next.sourceIdentifier = derivedIdentifier ?? next.sourceIdentifier;
  next.sourceType = derivedType;
  next.source = describeSourceLabel(derivedType, next.source);
  next.cleansedId =
    pickString(backend.cleansedId) ??
    pickString(backend.cleansedDataStoreId) ??
    next.cleansedId ??
    id;
  return next;
};

const mapLocalContext = (local: EnrichmentContext | null): RemoteEnrichmentContext | null => {
  if (!local) return null;
  return {
    metadata: local.metadata,
    startedAt: local.startedAt,
    statusHistory: local.statusHistory,
  };
};

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

export default function EnrichmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const localSnapshot = mapLocalContext(loadEnrichmentContext());

  const [context, setContext] = useState<RemoteEnrichmentContext | null>(localSnapshot);
  const [loading, setLoading] = useState<boolean>(!localSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<Feedback>({ state: "idle" });
  const [summaryFeedback, setSummaryFeedback] = useState<SummaryFeedback>({ state: "idle" });
  const [summary, setSummary] = useState<string | null>(null);
  const [enrichmentDetails, setEnrichmentDetails] = useState<EnrichmentDetailRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    queryId ?? localSnapshot?.metadata.cleansedId ?? null,
  );

  useEffect(() => {
    const fallbackId = localSnapshot?.metadata.cleansedId ?? null;
    setActiveId(queryId ?? fallbackId);
  }, [queryId, localSnapshot?.metadata.cleansedId]);

const fetchRemoteStatus = async (id: string): Promise<RemoteEnrichmentContext> => {
  const response = await fetch(`/api/ingestion/enrichment/status?id=${encodeURIComponent(id)}`);
  const { body, rawBody } = await parseJson(response);

  if (response.status === 404) {
    const fallbackMetadata = buildDefaultMetadata(id, localSnapshot?.metadata ?? undefined);
    const fallbackHistory =
      localSnapshot?.statusHistory && localSnapshot.statusHistory.length
        ? localSnapshot.statusHistory
        : FALLBACK_HISTORY;
    return {
      metadata: fallbackMetadata,
      startedAt: localSnapshot?.startedAt ?? Date.now(),
      statusHistory: fallbackHistory,
    };
  }

  if (!response.ok) {
    throw new Error(
      (body as Record<string, unknown>)?.error as string ??
        rawBody ??
        "Backend rejected the enrichment status request.",
    );
  }

  const proxyPayload = (body as Record<string, unknown>) ?? {};
  let backendRecord: Record<string, unknown> | null = null;
  if (proxyPayload.body && typeof proxyPayload.body === "object") {
    backendRecord = proxyPayload.body as Record<string, unknown>;
  } else if (!("body" in proxyPayload) && typeof proxyPayload === "object") {
    backendRecord = proxyPayload;
  }
  const fallbackMetadata = buildDefaultMetadata(id, localSnapshot?.metadata ?? undefined);
  const mergedMetadata = buildMetadataFromBackend(backendRecord, fallbackMetadata, id);
  const backendHistory = Array.isArray(
    backendRecord?.["statusHistory"] as { status: string; timestamp: number }[] | undefined,
  )
    ? (backendRecord?.["statusHistory"] as { status: string; timestamp: number }[])
    : null;

  return {
    metadata: mergedMetadata,
    startedAt:
      pickNumber(backendRecord?.startedAt) ??
      pickNumber(proxyPayload.startedAt) ??
      Date.now(),
    statusHistory: backendHistory && backendHistory.length ? backendHistory : FALLBACK_HISTORY,
  };
};

  const loadContext = async (
    id: string | null,
    options: { showSpinner?: boolean; rethrowOnError?: boolean } = {},
  ) => {
    const { showSpinner = true, rethrowOnError = false } = options;
    if (!id) {
      setLoading(false);
      setError("Provide a cleansed ID via the URL or trigger a new run.");
      setContext(localSnapshot);
      return null;
    }
    if (showSpinner) {
      setLoading(true);
    }
    setError(null);
    try {
      const remote = await fetchRemoteStatus(id);
      setContext(remote);
      return remote;
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to load enrichment status.");
      if (!showSpinner && localSnapshot) {
        setContext(localSnapshot);
      } else if (!localSnapshot) {
        setContext(null);
      }
      if (rethrowOnError) {
        throw statusError;
      }
      return null;
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const fetchSummary = async (id: string, showLoading = true) => {
    if (showLoading) {
      setSummaryFeedback({ state: "loading" });
    }
    try {
      const response = await fetch(`/api/ingestion/enrichment/result?id=${encodeURIComponent(id)}`);
      const { body, rawBody } = await parseJson(response);
      if (!response.ok) {
        if (response.status === 404) {
          setSummary(null);
          setEnrichmentDetails([]);
          setSummaryFeedback({ state: "idle" });
          return;
        }
        throw new Error(
          (body as Record<string, unknown>)?.error as string ??
            rawBody ??
            "Backend rejected the enrichment result request.",
        );
      }
      const proxyPayload = (body as Record<string, unknown>) ?? {};
      const normalizedDetails = normalizeProxyDetails(proxyPayload.details);
      setEnrichmentDetails(normalizedDetails);
      const combinedDetailSummary = buildSummaryFromDetails(normalizedDetails);
      const summarySource =
        (typeof proxyPayload.summary === "string" && proxyPayload.summary.trim().length
          ? proxyPayload.summary
          : combinedDetailSummary ??
            proxyPayload.body ??
            proxyPayload.rawBody ??
            rawBody ??
            "Awaiting enrichment results.");
      const derivedSummary =
        typeof summarySource === "string" ? summarySource : extractSummary(summarySource);
      setSummary(derivedSummary ?? combinedDetailSummary ?? null);
      setSummaryFeedback({ state: "idle" });
    } catch (summaryError) {
      setSummaryFeedback({
        state: "error",
        message: summaryError instanceof Error ? summaryError.message : "Unable to load enrichment results.",
      });
    }
  };

  useEffect(() => {
    loadContext(activeId).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    if (context?.metadata.cleansedId) {
      fetchSummary(context.metadata.cleansedId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.metadata.cleansedId]);

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
    if (!activeId) {
      setStatusFeedback({
        state: "error",
        message: "Cleansed ID missing; re-run cleansing before enrichment.",
      });
      return;
    }
    setStatusFeedback({ state: "loading" });
    try {
      await loadContext(activeId, { showSpinner: false, rethrowOnError: true });
      setStatusFeedback({ state: "success", message: "Status refreshed." });
      await fetchSummary(activeId, false);
    } catch (refreshError) {
      setStatusFeedback({
        state: "error",
        message: refreshError instanceof Error ? refreshError.message : "Unable to refresh status.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Enrichment</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Loading status…</h1>
          <p className="mt-4 text-sm text-slate-500">
            Fetching enrichment details from the backend. One moment please.
          </p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Enrichment</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {error ?? "Enrichment data not found"}
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

  const sourceLabel = describeSourceLabel(
    context.metadata.sourceType ?? context.metadata.source,
    context.metadata.source,
  );
  const sourceIdentifier = context.metadata.sourceIdentifier ?? "—";

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
              <p className="text-sm font-semibold text-slate-900">{sourceLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Source identifier
              </p>
              <p className="text-sm font-semibold text-slate-900 break-all">{sourceIdentifier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Started at</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatTimestamp(context.startedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Last update</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatTimestamp(
                  statusHistory[statusHistory.length - 1]?.timestamp ?? context.startedAt,
                )}
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
                  <p className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</p>
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
                  onClick={() => context.metadata.cleansedId && fetchSummary(context.metadata.cleansedId, true)}
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
          {enrichmentDetails.length > 0 && (
            <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {enrichmentDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{detail.cleansedItem}</p>
                      <p className="text-xs text-slate-500">AI-derived insight</p>
                    </div>
                    {detail.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {detail.tags.map((tag) => (
                          <span
                            key={`${detail.id}-header-tag-${tag}`}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                    {detail.summary ?? "Summary pending from enrichment pipeline."}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Tags
                      </p>
                      {detail.tags.length ? (
                        <div className="flex flex-wrap gap-1">
                          {detail.tags.map((tag) => (
                            <span
                              key={`${detail.id}-tag-${tag}`}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">—</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Sentiments
                      </p>
                      {detail.sentiments.length ? (
                        <div className="flex flex-wrap gap-1">
                          {detail.sentiments.map((sentiment) => (
                            <span
                              key={`${detail.id}-sentiment-${sentiment}`}
                              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
                            >
                              {sentiment}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">—</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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