"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearCleansedContext,
  loadCleansedContext,
  saveEnrichmentContext,
  type CleansedContext,
} from "@/lib/extraction-context";
import { PipelineTracker } from "@/components/PipelineTracker";
import { describeSourceLabel, inferSourceType, pickString } from "@/lib/source";

const RULES = [
  {
    title: "Whitespace normalization",
    description: "Collapses redundant spaces, tabs, and line breaks to a single space.",
  },
  {
    title: "Markup removal",
    description: "Strips internal tokens (e.g. {%url%}, sosumi, wj markers) from copy blocks.",
  },
  {
    title: "Locale-aware punctuation",
    description: "Replaces smart quotes, ellipsis, and em-dashes with locale-specific glyphs.",
  },
  {
    title: "Sensitive token scrub",
    description: "Masks e-mail addresses, PII placeholders, and debugging metadata.",
  },
];

type Feedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

type RemoteCleansedContext = {
  metadata: CleansedContext["metadata"];
  status?: string;
  items?: unknown[];
  rawBody?: string;
  fallbackReason?: string;
};

const mapLocalContext = (local: CleansedContext | null): RemoteCleansedContext | null => {
  if (!local) return null;
  return {
    metadata: local.metadata,
    status: local.status,
    items: local.items,
    rawBody: local.rawBody,
    fallbackReason: local.fallbackReason,
  };
};

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

const deriveItems = (items?: unknown[], rawBody?: string): unknown[] => {
  if (Array.isArray(items) && items.length) {
    return items;
  }

  if (typeof rawBody === "string" && rawBody.trim()) {
    try {
      const parsed = JSON.parse(rawBody);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") {
        const source = parsed as Record<string, unknown>;
        const candidateKeys = [
          "items",
          "records",
          "data",
          "payload",
          "cleansedItems",
          "originalItems",
          "result",
          "body",
        ];
        const pickArray = (record: Record<string, unknown>): unknown[] => {
          for (const key of candidateKeys) {
            const candidate = record[key];
            if (Array.isArray(candidate)) {
              return candidate as unknown[];
            }
            if (candidate && typeof candidate === "object") {
              const nested = candidate as Record<string, unknown>;
              if (Array.isArray(nested.items)) {
                return nested.items as unknown[];
              }
            }
          }
          return [];
        };
        const derived = pickArray(source);
        if (derived.length) {
          return derived;
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  return [];
};

const getFirstValue = (payload: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = payload[key];
    if (
      value !== undefined &&
      value !== null &&
      !(typeof value === "string" && value.trim().length === 0)
    ) {
      return value;
    }
  }
  return undefined;
};

const formatValue = (value: unknown) => {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
};

const isDisplayable = (value: unknown) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return false;
};

const pickValueFromPayload = (
  payload: Record<string, unknown>,
  preferredKeys: string[],
  explicitKey?: string | null,
): unknown => {
  for (const key of preferredKeys) {
    const candidate = payload[key];
    if (isDisplayable(candidate)) {
      return candidate;
    }
  }

  if (explicitKey && isDisplayable(payload[explicitKey])) {
    return payload[explicitKey];
  }

  for (const key of FALLBACK_VALUE_KEYS) {
    const candidate = payload[key];
    if (isDisplayable(candidate)) {
      return candidate;
    }
  }

  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith("_")) continue;
    if (isDisplayable(value)) {
      return value;
    }
  }

  return undefined;
};

const normalizeLabel = (rawLabel: string | undefined, fallback: string): string => {
  if (!rawLabel) return fallback;
  const withoutRef = rawLabel.split("::ref::").pop()?.trim() ?? rawLabel;
  const cleaned = withoutRef.replace(/\s+/g, " ").trim();
  const segments = cleaned.split(/[./]/).filter(Boolean);
  const candidate = segments[segments.length - 1] ?? cleaned;
  return candidate.replace(/\[[0-9]+\]/g, "") || fallback;
};

const VALUE_LABEL_KEYS = [
  "field",
  "label",
  "path",
  "key",
  "name",
  "usagePath",
  "itemType",
  "originalFieldName",
];
const ORIGINAL_VALUE_KEYS = [
  "originalValue",
  "rawValue",
  "sourceValue",
  "before",
  "input",
  "valueBefore",
];
const CLEANSED_VALUE_KEYS = [
  "cleansedValue",
  "cleanedValue",
  "normalizedValue",
  "after",
  "output",
  "valueAfter",
  "value",
];
const FALLBACK_VALUE_KEYS = [
  "value",
  "text",
  "copy",
  "content",
  "payload",
  "cleaned",
  "items",
];

const pickNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
};

const buildDefaultMetadata = (
  id: string,
  fallback?: CleansedContext["metadata"],
): CleansedContext["metadata"] => {
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
  fallback: CleansedContext["metadata"],
  id: string,
): CleansedContext["metadata"] => {
  if (!backend) return fallback;
  const metadataRecord =
    backend.metadata && typeof backend.metadata === "object"
      ? (backend.metadata as Record<string, unknown>)
      : null;

  const next: CleansedContext["metadata"] = { ...fallback };

  if (metadataRecord) {
    next.name = pickString(metadataRecord.name) ?? next.name;
    next.source = pickString(metadataRecord.source) ?? next.source;
    next.cleansedId = pickString(metadataRecord.cleansedId) ?? next.cleansedId;
    next.status = pickString(metadataRecord.status) ?? next.status;
    next.sourceIdentifier =
      pickString(metadataRecord.sourceIdentifier) ?? next.sourceIdentifier;
    next.sourceType = pickString(metadataRecord.sourceType) ?? next.sourceType;
    const uploadedAtCandidate = pickNumber(metadataRecord.uploadedAt);
    if (uploadedAtCandidate) {
      next.uploadedAt = uploadedAtCandidate;
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

const FeedbackPill = ({ feedback }: { feedback: Feedback }) => {
  if (feedback.state === "idle") return null;
  const base =
    feedback.state === "loading"
      ? "bg-indigo-50 text-indigo-600"
      : feedback.state === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-rose-50 text-rose-700";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${base}`}>
      {feedback.state === "loading"
        ? "Triggering enrichment…"
        : feedback.message ?? (feedback.state === "success" ? "Enrichment triggered." : "Something went wrong.")}
    </div>
  );
};

export default function CleansingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const localSnapshot = mapLocalContext(loadCleansedContext());

  const [context, setContext] = useState<RemoteCleansedContext | null>(localSnapshot);
  const [items, setItems] = useState<unknown[]>(deriveItems(localSnapshot?.items, localSnapshot?.rawBody));
  const [loading, setLoading] = useState<boolean>(!localSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [enrichmentFeedback, setEnrichmentFeedback] = useState<Feedback>({ state: "idle" });
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const fallbackId = localSnapshot?.metadata.cleansedId ?? null;
    setActiveId(queryId ?? fallbackId);
  }, [queryId, localSnapshot?.metadata.cleansedId]);

  const fetchItems = async (id: string, options: { showSpinner?: boolean } = {}) => {
    const { showSpinner = true } = options;
    if (showSpinner) {
      setItemsLoading(true);
    }
    setItemsError(null);
    try {
      const response = await fetch(`/api/ingestion/cleansed-items?id=${encodeURIComponent(id)}`);
      const { body, rawBody } = await parseJson(response);
      if (!response.ok) {
        if (response.status === 404) {
          setItems([]);
          setItemsError("Cleansed rows are not available yet.");
          return;
        }
        throw new Error(
          (body as Record<string, unknown>)?.error as string ??
            rawBody ??
            "Backend rejected the items request.",
        );
      }
      const payloadRecord = (body as Record<string, unknown>) ?? {};
      const candidateKeys = [
        "items",
        "records",
        "data",
        "payload",
        "cleansedItems",
        "result",
        "body",
      ];
      const pickArrayFromRecord = (record: Record<string, unknown>): unknown[] => {
        for (const key of candidateKeys) {
          const candidate = record[key];
          if (Array.isArray(candidate)) {
            return candidate as unknown[];
          }
          if (candidate && typeof candidate === "object" && Array.isArray((candidate as any).items)) {
            return (candidate as any).items as unknown[];
          }
        }
        return [];
      };
      let normalized = pickArrayFromRecord(payloadRecord);
      if (!normalized.length && typeof payloadRecord.body === "object" && payloadRecord.body) {
        normalized = pickArrayFromRecord(payloadRecord.body as Record<string, unknown>);
      }
      setItems(normalized);
      setContext((previous) =>
        previous
          ? {
              ...previous,
              items: normalized,
              rawBody:
                typeof (body as Record<string, unknown>)?.rawBody === "string"
                  ? ((body as Record<string, unknown>).rawBody as string)
                  : previous.rawBody,
            }
          : previous,
      );
    } catch (itemsErr) {
      setItemsError(itemsErr instanceof Error ? itemsErr.message : "Unable to fetch cleansed items.");
    } finally {
      if (showSpinner) {
        setItemsLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchContext = async (id: string | null) => {
      if (!id) {
        setLoading(false);
        setError("Provide a cleansed ID via the URL or trigger a new run.");
        setContext(localSnapshot);
        setItems(deriveItems(localSnapshot?.items, localSnapshot?.rawBody));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ingestion/cleansed-context?id=${encodeURIComponent(id)}`);
        const { body, rawBody } = await parseJson(response);
        if (!response.ok) {
          throw new Error(
            (body as Record<string, unknown>)?.error as string ??
              rawBody ??
              "Backend rejected the cleansed context request.",
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
        const remoteMetadata = buildMetadataFromBackend(backendRecord, fallbackMetadata, id);
        const proxiedRawBody =
          pickString(proxyPayload.rawBody) ?? (typeof rawBody === "string" ? rawBody : undefined);
        const remoteContext: RemoteCleansedContext = {
          metadata: remoteMetadata,
          status: pickString(backendRecord?.status) ?? localSnapshot?.status,
          items: Array.isArray(backendRecord?.items)
            ? (backendRecord?.items as unknown[])
            : undefined,
          rawBody: proxiedRawBody,
          fallbackReason:
            pickString(proxyPayload.fallbackReason) ??
            pickString(backendRecord?.fallbackReason) ??
            localSnapshot?.fallbackReason,
        };
        setContext(remoteContext);
        const derived = deriveItems(remoteContext.items, remoteContext.rawBody);
        setItems(derived);
        await fetchItems(id, { showSpinner: derived.length === 0 });
      } catch (contextError) {
        setError(
          contextError instanceof Error ? contextError.message : "Unable to load cleansed context.",
        );
        if (localSnapshot) {
          setContext(localSnapshot);
          setItems(deriveItems(localSnapshot.items, localSnapshot.rawBody));
        } else {
          setContext(null);
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContext(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const previewRows = useMemo(() => {
    return items.map((item, index) => {
      if (typeof item === "object" && item !== null) {
        const payload = item as Record<string, unknown>;
        const rawLabel = getFirstValue(payload, VALUE_LABEL_KEYS) as string | undefined;
        const derivedLabel = normalizeLabel(
          rawLabel,
          (payload.originalFieldName as string | undefined) ??
            (payload.itemType as string | undefined) ??
            `Item ${index + 1}`,
        );
        const originalCandidate =
          getFirstValue(payload, ORIGINAL_VALUE_KEYS) ??
          pickValueFromPayload(payload, ORIGINAL_VALUE_KEYS, derivedLabel);
        const cleansedCandidate =
          getFirstValue(payload, CLEANSED_VALUE_KEYS) ??
          pickValueFromPayload(payload, CLEANSED_VALUE_KEYS, derivedLabel);
        return {
          id: payload.id ?? `${derivedLabel}-${index}`,
          label: derivedLabel,
          original: formatValue(originalCandidate),
          cleansed: formatValue(cleansedCandidate),
        };
      }
      return {
        id: `item-${index}`,
        label: `Item ${index + 1}`,
        original: formatValue(item),
        cleansed: formatValue(item),
      };
    });
  }, [items]);

  const handleSendToEnrichment = async () => {
    if (!context?.metadata.cleansedId) {
      setEnrichmentFeedback({
        state: "error",
        message: "Cleansed ID is missing. Re-run extraction before enrichment.",
      });
      return;
    }

    setEnrichmentFeedback({ state: "loading", message: "Triggering enrichment…" });
    try {
      const response = await fetch("/api/ingestion/enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: context.metadata.cleansedId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setEnrichmentFeedback({
          state: "error",
          message: payload?.error ?? "Backend rejected the request.",
        });
        return;
      }

      const now = Date.now();
      saveEnrichmentContext({
        metadata: context.metadata,
        startedAt: now,
        statusHistory: [
          { status: "ENRICHMENT_TRIGGERED", timestamp: now },
          {
            status:
              typeof payload?.body?.status === "string"
                ? payload.body.status
                : "WAITING_FOR_RESULTS",
            timestamp: now,
          },
        ],
      });

      setEnrichmentFeedback({
        state: "success",
        message: "Enrichment pipeline triggered.",
      });
      router.push(`/enrichment?id=${encodeURIComponent(context.metadata.cleansedId)}`);
    } catch (error) {
      setEnrichmentFeedback({
        state: "error",
        message:
          error instanceof Error ? error.message : "Unable to reach enrichment service.",
      });
    }
  };

  if (loading || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Cleansing</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Loading context…</h1>
          <p className="mt-3 text-sm text-slate-500">
            Fetching cleansed snapshot from the backend. One moment please.
          </p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Cleansing</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {error ?? "Cleansed context not found"}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Provide a valid `id` query parameter or trigger the pipeline again.
          </p>
          <button
            type="button"
            onClick={() => router.push("/extraction")}
            className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white"
          >
            Back to Extraction
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
            <p className="text-xs uppercase tracking-wide text-slate-400">Cleansing</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Review cleansed output ({context.metadata.name})
            </h1>
          </div>
          <div className="flex flex-1 flex-col items-start gap-3 md:flex-row md:items-center md:justify-end">
            <PipelineTracker current="cleansing" />
            <FeedbackPill feedback={enrichmentFeedback} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {context.status ?? "Pending"}
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              <p>Uploaded</p>
              <p className="font-semibold text-slate-800">
                {new Date(context.metadata.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <dd className="text-sm font-semibold text-slate-900">{sourceLabel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Source identifier</dt>
              <dd className="text-sm font-semibold text-slate-900 break-all">
                {sourceIdentifier}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Cache status</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.fallbackReason === "quota" ? "Partial snapshot" : "Complete snapshot"}
              </dd>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Items</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Original vs Cleansed values
              </h2>
            </div>
          </div>

          {itemsLoading ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-600">
              Fetching latest cleansed rows…
            </div>
          ) : itemsError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Unable to load cleansed items.</p>
              <p className="mt-1">{itemsError}</p>
              <button
                type="button"
                onClick={() => context.metadata.cleansedId && fetchItems(context.metadata.cleansedId)}
                className="mt-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Retry fetch
              </button>
            </div>
          ) : previewRows.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
              No cleansed items available yet.
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-100">
              <div className="max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Field</th>
                    <th className="px-4 py-3 font-semibold">Original value</th>
                    <th className="px-4 py-3 font-semibold">Cleansed value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 align-top font-semibold text-slate-900">
                        {row.label}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">
                        <pre className="whitespace-pre-wrap text-xs">{row.original}</pre>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-700">
                        <pre className="whitespace-pre-wrap text-xs">{row.cleansed}</pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Applied rules</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Cleansing heuristics snapshot
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {RULES.map((rule) => (
                <div
                  key={rule.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner"
                >
                  <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Next steps</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Ready to send for enrichment?
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/extraction")}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Back to Extraction
              </button>
              <button
                type="button"
                onClick={handleSendToEnrichment}
                disabled={enrichmentFeedback.state === "loading"}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {enrichmentFeedback.state === "loading"
                  ? "Sending to Enrichment…"
                  : "Send to Enrichment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCleansedContext();
                  router.push("/ingestion");
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Start Over
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
