import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.SPRINGBOOT_BASE_URL;

const safeParse = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

const pickString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [
      record.items,
      record.records,
      record.data,
      record.result,
      record.entries,
      record.enrichedItems,
      record.consolidatedItems,
      record.payload,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }
  return [];
};

const toStringList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => pickString(entry))
      .filter((entry): entry is string => Boolean(entry));
  }
  const asString = pickString(value);
  if (!asString) return [];
  if (asString.includes(",")) {
    return asString
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
  }
  return [asString];
};

type EnrichmentDetail = {
  id: string;
  cleansedItem: string;
  summary?: string;
  tags: string[];
  sentiments: string[];
};

const FIELD_KEYS = [
  "cleansedItem",
  "cleansedContent",
  "item",
  "field",
  "label",
  "title",
  "name",
  "copy",
  "original",
];

const SUMMARY_KEYS = [
  "summary",
  "aiSummary",
  "analysis",
  "description",
  "insight",
  "text",
  "content",
];

const TAG_KEYS = ["tags", "topics", "labels", "categories"];
const SENTIMENT_KEYS = ["sentiments", "sentiment", "tone", "tones"];

const pickFromSources = (sources: Array<Record<string, unknown>>, keys: string[]): string | undefined => {
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

const pickArrayFromSources = (sources: Array<Record<string, unknown>>, keys: string[]): string[] => {
  for (const key of keys) {
    for (const source of sources) {
      const candidate = source[key];
      const normalized = toStringList(candidate);
      if (normalized.length) {
        return normalized;
      }
    }
  }
  return [];
};

const normalizeEnrichmentDetails = (payload: unknown): EnrichmentDetail[] => {
  const rows = toArray(payload)
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const context = typeof record.context === "object" && record.context !== null
        ? (record.context as Record<string, unknown>)
        : null;
      const metadata = typeof record.metadata === "object" && record.metadata !== null
        ? (record.metadata as Record<string, unknown>)
        : null;
      const facets = context && typeof context.facets === "object" && context.facets !== null
        ? (context.facets as Record<string, unknown>)
        : null;

      const sources: Array<Record<string, unknown>> = [record];
      if (context) sources.push(context);
      if (facets) sources.push(facets);
      if (metadata) sources.push(metadata);

      const label =
        pickFromSources(sources, FIELD_KEYS) ??
        `Item ${index + 1}`;
      const summary = pickFromSources(sources, SUMMARY_KEYS);
      const tags = pickArrayFromSources(sources, TAG_KEYS);
      const sentiments = pickArrayFromSources(sources, SENTIMENT_KEYS);

      return {
        id: pickString(record.id) ?? pickString(record.cleansedDataStoreId) ?? pickString(record.contentHash) ?? `enrichment-${index}`,
        cleansedItem: label,
        summary: summary ?? undefined,
        tags,
        sentiments,
      } as EnrichmentDetail;
    })
    .filter((row): row is EnrichmentDetail => Boolean(row));

  return rows;
};

const buildSummaryText = (details: EnrichmentDetail[], fallback: unknown): string | undefined => {
  if (details.length) {
    return details
      .map((detail) => {
        const headline = detail.cleansedItem;
        const summary = detail.summary ?? "Awaiting summary.";
        const tagsLine = detail.tags.length ? `Tags: ${detail.tags.join(", ")}` : null;
        const sentimentsLine = detail.sentiments.length ? `Sentiments: ${detail.sentiments.join(", ")}` : null;
        return [`${headline}: ${summary}`, tagsLine, sentimentsLine]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  }
  const fallbackText = pickString(fallback);
  return fallbackText ?? undefined;
};

export async function GET(request: NextRequest) {
  if (!backendBaseUrl) {
    return NextResponse.json(
      { error: "SPRINGBOOT_BASE_URL is not configured." },
      { status: 500 },
    );
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing required `id` query parameter." },
      { status: 400 },
    );
  }

  try {
    const resultUrl = new URL(`/api/enrichment/result/${id}`, backendBaseUrl);
    const upstream = await fetch(resultUrl);
    const rawBody = await upstream.text();
    const body = safeParse(rawBody);
    const details = normalizeEnrichmentDetails(body);
    const summaryText = buildSummaryText(details, rawBody);

    return NextResponse.json(
      {
        upstreamStatus: upstream.status,
        upstreamOk: upstream.ok,
        details,
        summary: summaryText,
        body,
        rawBody,
      },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to reach Spring Boot enrichment result endpoint.",
      },
      { status: 502 },
    );
  }
}