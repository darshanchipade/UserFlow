"use client";

import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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

type RemoteEnrichmentContext = {
  metadata: EnrichmentContext["metadata"];
  startedAt: number;
  statusHistory: { status: string; timestamp: number }[];
};

type SentimentSnapshot = {
  label: string;
  score?: number;
};

type EnrichedElement = {
  id: string;
  title: string;
  path?: string;
  copy?: string;
  summary?: string;
  classification: string[];
  keywords: string[];
  tags: string[];
  sentiment?: SentimentSnapshot | null;
  meta?: {
    fieldsTagged?: number;
    readabilityDelta?: number;
    errorsFound?: number;
  };
};

type EnrichmentOverview = {
  metrics: {
    totalFieldsTagged?: number | null;
    readabilityDelta?: number | null;
    errorsFound?: number | null;
  };
  elements: EnrichedElement[];
};

const EXCLUDED_ITEM_TYPES = [
  "analytics",
  "disclaimers",
  "pageanalyticsattributes",
  "alt",
  "analyticsattributes",
  "url",
];

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

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const parseJsonArrayStrings = (value: string): string[] => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => (typeof entry === "string" ? entry.trim() : undefined))
        .filter((entry): entry is string => Boolean(entry));
    }
  } catch {
    // ignore
  }
  return [];
};

const splitDelimitedString = (value: string): string[] => {
  const tokens = value
    .split(/[,|;>]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  return tokens;
};

const normalizeStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (isRecord(entry)) {
          return (
            pickString(entry.label) ??
            pickString(entry.name) ??
            pickString(entry.value) ??
            pickString(entry.text) ??
            undefined
          );
        }
        return undefined;
      })
      .filter((entry): entry is string => Boolean(entry));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const parsed = parseJsonArrayStrings(trimmed);
      if (parsed.length) {
        return parsed;
      }
    }
    return splitDelimitedString(trimmed);
  }
  if (isRecord(value)) {
    if (Array.isArray(value.values)) return normalizeStringList(value.values);
    if (Array.isArray(value.items)) return normalizeStringList(value.items);
    if (Array.isArray(value.labels)) return normalizeStringList(value.labels);
    if (Array.isArray(value.tags)) return normalizeStringList(value.tags);
  }
  return [];
};

const pickFromSources = (sources: Record<string, unknown>[], keys: string[]): string | undefined => {
  for (const key of keys) {
    for (const source of sources) {
      const candidate = pickString(source[key]);
      if (candidate) {
        return candidate;
      }
    }
  }
  return undefined;
};

const pickListFromSources = (sources: Record<string, unknown>[], keys: string[]): string[] => {
  for (const key of keys) {
    for (const source of sources) {
      const candidate = source[key];
      const normalized = normalizeStringList(candidate);
      if (normalized.length) {
        return normalized;
      }
    }
  }
  return [];
};

const extractSentimentFromSources = (
  sources: Record<string, unknown>[],
): SentimentSnapshot | null => {
  for (const source of sources) {
    const directLabel =
      pickString(source.sentiment) ??
      pickString(source.sentimentLabel) ??
      pickString(source.sentiment_label) ??
      pickString(source.tone) ??
      pickString(source.mood);
    const scoreCandidate =
      pickNumber(source.sentimentScore) ??
      pickNumber(source.sentiment_score) ??
      pickNumber(source.score) ??
      pickNumber(source.sentimentConfidence);

    if (directLabel) {
      return { label: directLabel, score: scoreCandidate };
    }

    const nested =
      (isRecord(source.sentiment) ? (source.sentiment as Record<string, unknown>) : null) ??
      (isRecord(source.sentimentAnalysis)
        ? (source.sentimentAnalysis as Record<string, unknown>)
        : null);

    if (nested) {
      const nestedLabel =
        pickString(nested.label) ?? pickString(nested.result) ?? pickString(nested.tone);
      if (nestedLabel) {
        return {
          label: nestedLabel,
          score: pickNumber(nested.score) ?? pickNumber(nested.confidence) ?? scoreCandidate,
        };
      }
    }
  }
  return null;
};

const findFirstRecordArray = (payload: unknown, depth = 0): Record<string, unknown>[] => {
  if (depth > 5 || payload === null || payload === undefined) return [];
  if (Array.isArray(payload)) {
    const records = payload.filter(isRecord);
    if (records.length) {
      return records;
    }
    for (const entry of payload) {
      const nested = findFirstRecordArray(entry, depth + 1);
      if (nested.length) {
        return nested;
      }
    }
    return [];
  }

  if (isRecord(payload)) {
    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) {
        const records = value.filter(isRecord);
        if (records.length) {
          return records;
        }
      }
    }
    for (const value of Object.values(payload)) {
      const nested = findFirstRecordArray(value, depth + 1);
      if (nested.length) {
        return nested;
      }
    }
  }

  return [];
};

const findNumberByKeys = (payload: unknown, keys: string[], depth = 0): number | undefined => {
  if (depth > 5 || payload === null || payload === undefined) return undefined;
  if (isRecord(payload)) {
    for (const key of keys) {
      if (key in payload) {
        const candidate = pickNumber(payload[key]);
        if (candidate !== undefined) {
          return candidate;
        }
      }
    }
    for (const value of Object.values(payload)) {
      const nested = findNumberByKeys(value, keys, depth + 1);
      if (nested !== undefined) {
        return nested;
      }
    }
  } else if (Array.isArray(payload)) {
    for (const value of payload) {
      const nested = findNumberByKeys(value, keys, depth + 1);
      if (nested !== undefined) {
        return nested;
      }
    }
  }
  return undefined;
};

const parseEnrichmentMetrics = (payload: unknown): EnrichmentOverview["metrics"] => {
  return {
    totalFieldsTagged: findNumberByKeys(payload, [
      "totalFieldsTagged",
      "fieldsTagged",
      "taggedFields",
      "totalFields",
      "fieldCount",
      "total_fields_tagged",
      "total_tagged_fields",
      "total_enriched_fields",
      "total_enriched_elements",
    ]),
    readabilityDelta: findNumberByKeys(payload, [
      "readabilityImproved",
      "readabilityDelta",
      "readabilityScoreDelta",
      "readability",
      "readabilityImprovement",
      "readability_improved",
      "readability_gain",
      "readability_gain_percent",
      "readabilityIncreasePercent",
    ]),
    errorsFound: findNumberByKeys(payload, [
      "errorsFound",
      "errorCount",
      "errors",
      "errors_detected",
      "error_total",
    ]),
  };
};

const pickNumberFromSources = (
  sources: Record<string, unknown>[],
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    for (const source of sources) {
      const candidate = pickNumber(source[key]);
      if (candidate !== undefined) {
        return candidate;
      }
    }
  }
  return undefined;
};

const normalizeEnrichmentResult = (payload: unknown): EnrichmentOverview => {
  if (!payload) {
    return { metrics: {}, elements: [] };
  }

  const baseRecord =
    isRecord(payload) && payload.body && typeof payload.body === "object"
      ? (payload.body as Record<string, unknown>)
      : payload;

  const metrics = parseEnrichmentMetrics(baseRecord);
  let sectionRecords: Record<string, unknown>[] = [];
  if (isRecord(baseRecord)) {
    const preferredKeys = [
      "enriched_content_elements",
      "enrichedContentElements",
      "enrichment_sections",
      "enrichmentSections",
      "elements",
      "records",
      "rows",
      "data",
    ];
    for (const key of preferredKeys) {
      if (Array.isArray(baseRecord[key])) {
        sectionRecords = (baseRecord[key] as unknown[]).filter(isRecord);
        if (sectionRecords.length) break;
      }
    }
  }
  if (!sectionRecords.length) {
    sectionRecords = findFirstRecordArray(baseRecord);
  }

  if (!sectionRecords.length) {
    return { metrics, elements: [] };
  }

  const elements = sectionRecords.map((record, index) => {
    const sources: Record<string, unknown>[] = [record];
    const nestedKeys = ["data", "attributes", "meta", "context", "details", "fields"];
    nestedKeys.forEach((key) => {
      const candidate = record[key];
      if (isRecord(candidate)) {
        sources.push(candidate);
      }
    });

    const id =
      pickFromSources(sources, [
        "id",
        "sectionId",
        "elementId",
        "element_id",
        "contentId",
        "content_id",
        "hash",
        "recordId",
      ]) ??
      `element-${index}`;
    const title =
      pickFromSources(sources, [
        "originalFieldName",
        "original_field_name",
        "title",
        "label",
        "name",
        "field",
        "section",
        "heading",
        "elementTitle",
        "element_title",
        "content_name",
      ]) ?? `Element ${index + 1}`;
    const path =
      pickFromSources(sources, [
        "path",
        "breadcrumb",
        "hierarchy",
        "location",
        "elementPath",
        "element_path",
        "sectionPath",
        "section_path",
      ]) ?? pickFromSources(sources, ["parent", "group", "category"]);
    const copy =
      pickFromSources(sources, [
        "copy",
        "content",
        "text",
        "value",
        "enrichedCopy",
        "enriched_copy",
        "output",
        "body",
        "copy_text",
        "copyText",
        "copyValue",
        "aiCopy",
        "ai_copy",
        "cleansedText",
        "cleansed_text",
        "cleansedValue",
        "cleansed_value",
        "cleansedContent",
        "cleansed_content",
        "cleansedCopy",
        "cleansed_copy",
      ]) ?? undefined;
    const summaryValue =
      pickFromSources(sources, ["summary", "aiSummary", "insights", "analysis", "result"]) ??
      pickFromSources(sources, ["summary_text", "ai_summary", "summaryText"]) ??
      copy ??
      undefined;

    const classification = pickListFromSources(sources, [
      "classification",
      "classifications",
      "categories",
      "category",
      "taxonomy",
      "classification_path",
      "classificationPath",
      "category_path",
    ]);
    const keywords = pickListFromSources(sources, ["keywords", "keywordList", "searchKeywords"]);
    const tags = pickListFromSources(sources, [
      "tags",
      "labels",
      "contentTags",
      "tagList",
      "content_tags",
    ]);
    const sentiment = extractSentimentFromSources(sources);
    const elementFieldsTagged = pickNumberFromSources(sources, [
      "fieldsTagged",
      "fieldCount",
      "totalFieldsTagged",
      "total_fields_tagged",
    ]);
    const elementReadability = pickNumberFromSources(sources, [
      "readabilityImproved",
      "readabilityDelta",
      "readabilityScoreDelta",
      "readability_improved",
      "readability_gain",
    ]);
    const elementErrors = pickNumberFromSources(sources, ["errorsFound", "errorCount", "errors"]);

    return {
      id,
      title,
      path: path ?? undefined,
      copy,
      summary: summaryValue,
      classification,
      keywords,
      tags,
      sentiment,
      meta: {
        fieldsTagged: elementFieldsTagged,
        readabilityDelta: elementReadability,
        errorsFound: elementErrors,
      },
    };
  });

  const aggregatedMetrics = { ...metrics };
  if (aggregatedMetrics.totalFieldsTagged == null) {
    const sum =
      elements.reduce((acc, element) => acc + (element.meta?.fieldsTagged ?? 0), 0) ||
      (elements.length ? elements.length : 0);
    aggregatedMetrics.totalFieldsTagged = sum || null;
  }
  if (aggregatedMetrics.readabilityDelta == null) {
    const firstDelta = elements.find((element) => element.meta?.readabilityDelta !== undefined)
      ?.meta?.readabilityDelta;
    aggregatedMetrics.readabilityDelta = firstDelta ?? null;
  }
  if (aggregatedMetrics.errorsFound == null) {
    const sumErrors = elements.reduce(
      (acc, element) => acc + (element.meta?.errorsFound ?? 0),
      0,
    );
    aggregatedMetrics.errorsFound = sumErrors || null;
  }

  return { metrics: aggregatedMetrics, elements };
};

const humanizePath = (path: string) => {
  const withoutRef = path.includes("::") ? path.split("::").pop()?.trim() ?? path : path;
  const segments = withoutRef.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? withoutRef;
  return lastSegment.replace(/[-_]/g, " ").trim() || "Enriched section";
};

const buildGroupKey = (element: EnrichedElement, index: number) => {
  if (element.path?.trim()) {
    return element.path.trim();
  }
  if (element.title?.trim()) {
    return `title:${element.title.trim().toLowerCase()}`;
  }
  return `group-${index}`;
};

const buildGroupLabel = (key: string, fallback: EnrichedElement, index: number) => {
  if (key.startsWith("title:")) {
    return key.replace(/^title:/, "");
  }
  if (fallback.path?.trim()) {
    return humanizePath(fallback.path);
  }
  return fallback.title?.trim() ?? `Element group ${index + 1}`;
};

const shouldHideElement = (element: EnrichedElement): boolean => {
  const normalizedTitle = element.title?.toLowerCase().trim();
  if (!normalizedTitle) {
    return false;
  }
  return EXCLUDED_ITEM_TYPES.some((excluded) => {
    return (
      normalizedTitle === excluded ||
      normalizedTitle.startsWith(`${excluded}[`) ||
      normalizedTitle.startsWith(`${excluded}.`) ||
      normalizedTitle.includes(`${excluded}:`)
    );
  });
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
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentOverview | null>(null);
  const [rawSummary, setRawSummary] = useState<string | null>(null);
  const [expandedElementId, setExpandedElementId] = useState<string | null>(null);
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
          setEnrichmentResult(null);
          setRawSummary("Awaiting enrichment results.");
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
      const normalized = normalizeEnrichmentResult(proxyPayload);
      setEnrichmentResult(normalized);
      const summarySource =
        proxyPayload.body ?? proxyPayload.rawBody ?? rawBody ?? "Awaiting enrichment results.";
      if (!normalized.elements.length) {
        setRawSummary(extractSummary(summarySource));
      } else {
        setRawSummary(null);
        setContext((previous) => {
          return previous;
        });
      }
      setSummaryFeedback({ state: "idle" });
    } catch (summaryError) {
      setEnrichmentResult(null);
      setRawSummary(null);
      setSummaryFeedback({
        state: "error",
        message: summaryError instanceof Error ? summaryError.message : "Unable to load enrichment results.",
      });
    }
  };

  const filteredElements = useMemo(() => {
    if (!enrichmentResult?.elements.length) return [];
    return enrichmentResult.elements.filter((element) => !shouldHideElement(element));
  }, [enrichmentResult?.elements]);

  const groupedElements = useMemo(() => {
    if (!filteredElements.length) return [];
    const groups = new Map<string, { label: string; elements: EnrichedElement[] }>();
    filteredElements.forEach((element, index) => {
      const key = buildGroupKey(element, index);
      const existing = groups.get(key);
      if (existing) {
        existing.elements.push(element);
        return;
      }
      groups.set(key, {
        label: buildGroupLabel(key, element, index),
        elements: [element],
      });
    });
    return Array.from(groups.entries()).map(([key, value]) => ({
      id: key || `group-${value.label}-${value.elements.length}`,
      label: value.label,
      elements: value.elements,
    }));
  }, [filteredElements]);

  const [expandedGroups, setExpandedGroups] = useState(new Set<string>());

  useEffect(() => {
    if (!groupedElements.length) {
      setExpandedGroups(new Set());
      setExpandedElementId(null);
      return;
    }
    setExpandedGroups(new Set(groupedElements.map((group) => group.id)));
    setExpandedElementId((current) => {
      if (current && filteredElements.some((element) => element.id === current)) {
        return current;
      }
      return filteredElements[0]?.id ?? null;
    });
  }, [groupedElements, filteredElements]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((previous) => {
      const next = new Set(previous);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleElementDetails = (elementId: string) => {
    setExpandedElementId((current) => (current === elementId ? null : elementId));
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

  const groupedElements = useMemo(() => {
    if (!filteredElements.length) return [];
    const groups = new Map<string, { label: string; elements: EnrichedElement[] }>();
    filteredElements.forEach((element, index) => {
      const key = buildGroupKey(element, index);
      const existing = groups.get(key);
      if (existing) {
        existing.elements.push(element);
        return;
      }
      groups.set(key, {
        label: buildGroupLabel(key, element, index),
        elements: [element],
      });
    });
    return Array.from(groups.entries()).map(([key, value]) => ({
      id: key || `group-${value.label}-${value.elements.length}`,
      label: value.label,
      elements: value.elements,
    }));
  }, [filteredElements]);

  useEffect(() => {
    if (!groupedElements.length) {
      setExpandedGroups(new Set());
      setExpandedElementId(null);
      return;
    }
    setExpandedGroups(new Set(groupedElements.map((group) => group.id)));
    setExpandedElementId((current) => {
      if (current && filteredElements.some((element) => element.id === current)) {
        return current;
      }
      return filteredElements[0]?.id ?? null;
    });
  }, [groupedElements, filteredElements]);

  const metrics = enrichmentResult?.metrics ?? {};
  const totalFieldsTagged =
    metrics.totalFieldsTagged !== null && metrics.totalFieldsTagged !== undefined
      ? Math.round(metrics.totalFieldsTagged)
      : null;
  const readabilityDelta =
    metrics.readabilityDelta !== null && metrics.readabilityDelta !== undefined
      ? metrics.readabilityDelta
      : null;
  const errorsFoundMetric =
    metrics.errorsFound !== null && metrics.errorsFound !== undefined ? metrics.errorsFound : null;
  const normalizedReadability =
    readabilityDelta !== null && Number.isFinite(readabilityDelta)
      ? Math.abs(readabilityDelta) <= 1
        ? readabilityDelta * 100
        : readabilityDelta
      : null;
  const readabilityDisplay =
    normalizedReadability !== null
      ? `${normalizedReadability > 0 ? "+" : ""}${Math.round(normalizedReadability)}%`
      : null;
  const errorsDisplay =
    errorsFoundMetric !== null ? Math.max(0, Math.round(errorsFoundMetric)) : null;

  const renderChipList = (items: string[], emptyLabel: string) => {
    if (!items.length) {
      return <p className="text-sm text-slate-500">{emptyLabel}</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total fields tagged</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalFieldsTagged ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Readability improved</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {readabilityDisplay ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Errors found</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{errorsDisplay ?? "—"}</p>
            </div>
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
          {summaryFeedback.state === "loading" ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading enrichment summary…
            </div>
          ) : summaryFeedback.state === "error" ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">Unable to load enrichment summary.</p>
              <p className="text-xs text-amber-900/80">{summaryFeedback.message}</p>
              <button
                type="button"
                onClick={() => context.metadata.cleansedId && fetchSummary(context.metadata.cleansedId, true)}
                className="mt-3 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : enrichmentResult?.elements.length ? (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Enriched sections</p>
              <div className="mt-3 max-h-[480px] space-y-3 overflow-y-auto pr-2">
                {groupedElements.map((group) => {
                  const isExpanded = expandedGroups.has(group.id);
                  return (
                    <div key={group.id} className="rounded-xl border border-slate-100 bg-white">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-semibold text-slate-800"
                      >
                        <span className="flex-1 truncate">{group.label}</span>
                        <span className="text-xs font-semibold text-slate-400">
                          {group.elements.length}
                        </span>
                        {isExpanded ? (
                          <ChevronDownIcon className="size-4 text-slate-400" />
                        ) : (
                          <ChevronRightIcon className="size-4 text-slate-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="space-y-2 border-t border-slate-100 bg-slate-50 px-3 py-3">
                          {group.elements.map((element) => {
                            const isDetailVisible = expandedElementId === element.id;
                            return (
                              <div
                                key={element.id}
                                className="rounded-lg border border-slate-200 bg-white"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleElementDetails(element.id)}
                                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-800"
                                >
                                  <div className="flex flex-col flex-1">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                      {element.title ?? `Element ${group.elements.indexOf(element) + 1}`}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                      {element.copy ?? element.summary ?? "No preview available."}
                                    </p>
                                  </div>
                                  {isDetailVisible ? (
                                    <ChevronDownIcon className="size-4 text-slate-400" />
                                  ) : (
                                    <ChevronRightIcon className="size-4 text-slate-400" />
                                  )}
                                </button>
                                {isDetailVisible && (
                                  <div className="space-y-4 border-t border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                                    <div>
                                      <p className="text-xs uppercase tracking-wide text-slate-400">
                                        Enriched copy
                                      </p>
                                      <p className="mt-1 text-sm text-slate-800">
                                        {element.copy ?? "No enriched copy provided yet."}
                                      </p>
                                    </div>
                                    <div className="grid gap-4 lg:grid-cols-3">
                                      <div className="rounded-xl border border-slate-100 bg-white p-4">
                                        <div className="flex items-center justify-between gap-2">
                                          <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                              Content insights
                                            </p>
                                            <h3 className="text-base font-semibold text-slate-900">
                                              Summary
                                            </h3>
                                          </div>
                                          <span className="text-xs font-semibold text-slate-500">
                                            {element.classification?.length ? "2 fields" : "1 field"}
                                          </span>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-700">
                                          {element.summary ?? "Summary not available yet."}
                                        </p>
                                        <div className="mt-4">
                                          <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Classification
                                          </p>
                                          {renderChipList(
                                            element.classification ?? [],
                                            "No classification detected.",
                                          )}
                                        </div>
                                      </div>
                                      <div className="rounded-xl border border-slate-100 bg-white p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                          Search metadata
                                        </p>
                                       <div className="mt-4 space-y-4">
                                          <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                              Keywords
                                            </p>
                                            {renderChipList(
                                              element.keywords ?? [],
                                              "Keywords pending enrichment.",
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                              Content tags
                                            </p>
                                            {renderChipList(
                                              element.tags ?? [],
                                              "Tags pending enrichment.",
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="rounded-xl border border-slate-100 bg-white p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                          Tone & sentiment
                                        </p>
                                        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                          {element.sentiment ? (
                                            <>
                                              <p className="text-sm font-semibold text-emerald-700">
                                                {element.sentiment.label}
                                              </p>
                                              {element.sentiment.score !== undefined && (
                                                <p className="text-xs text-emerald-800">
                                                  Score: {Math.round(element.sentiment.score * 100) / 100}
                                                </p>
                                              )}
                                            </>
                                          ) : (
                                            <p className="text-sm text-emerald-800/80">
                                              Sentiment analytics will appear after enrichment completes.
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!groupedElements.length && (
                  <p className="text-sm text-slate-500">No enriched sections available yet.</p>
                )}
              </div>
            </div>
          ) : rawSummary ? (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              <pre className="whitespace-pre-wrap">{rawSummary}</pre>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
              Awaiting enrichment results. Once the backend finishes generating AI insights, they’ll
              appear here automatically. Use the “Refresh status” button above to check for updates.
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