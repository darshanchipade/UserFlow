"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadCleansedContext,
  clearCleansedContext,
  saveEnrichmentContext,
  type CleansedContext,
} from "@/lib/extraction-context";
import { PipelineTracker } from "@/components/PipelineTracker";

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

const VALUE_LABEL_KEYS = ["field", "label", "path", "key", "name", "usagePath"];
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
  const [context, setContext] = useState<CleansedContext | null>(null);
  const [enrichmentFeedback, setEnrichmentFeedback] = useState<Feedback>({
    state: "idle",
  });

  useEffect(() => {
    setContext(loadCleansedContext());
  }, []);

  const itemsPreview = useMemo(() => {
    if (!context) return [];
    if (Array.isArray(context.items) && context.items.length > 0) {
      return context.items.slice(0, 10);
    }
    if (typeof context.rawBody === "string" && context.rawBody.trim()) {
      try {
        const parsed = JSON.parse(context.rawBody);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 10);
        }
        if (
          parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as Record<string, unknown>).items)
        ) {
          return ((parsed as Record<string, unknown>).items as unknown[]).slice(0, 10);
        }
      } catch {
        // ignore parse errors
      }
    }
    return [];
  }, [context]);

  const previewRows = useMemo(() => {
    return itemsPreview.map((item, index) => {
      if (typeof item === "object" && item !== null) {
        const payload = item as Record<string, unknown>;
        const label =
          (getFirstValue(payload, VALUE_LABEL_KEYS) as string | undefined) ??
          `Item ${index + 1}`;
        const originalCandidate = getFirstValue(payload, ORIGINAL_VALUE_KEYS);
        const cleansedCandidate = getFirstValue(payload, CLEANSED_VALUE_KEYS);
        return {
          id: payload.id ?? `${label}-${index}`,
          label,
          original: formatValue(originalCandidate ?? payload),
          cleansed: formatValue(cleansedCandidate ?? payload),
        };
      }
      return {
        id: `item-${index}`,
        label: `Item ${index + 1}`,
        original: formatValue(item),
        cleansed: formatValue(item),
      };
    });
  }, [itemsPreview]);

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
      router.push("/enrichment");
    } catch (error) {
      setEnrichmentFeedback({
        state: "error",
        message:
          error instanceof Error ? error.message : "Unable to reach enrichment service.",
      });
    }
  };

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
        <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Cleansing</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">No cleansing data yet</h1>
          <p className="mt-3 text-sm text-slate-500">
            Trigger cleansing from the Extraction view to review items here.
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
              <dd className="text-sm font-semibold text-slate-900">{context.metadata.source}</dd>
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
            {context.itemsTruncated && (
              <span className="text-xs font-semibold text-amber-600">
                Showing first {previewRows.length} items
              </span>
            )}
          </div>

          {previewRows.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
              No cleansed items available yet.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
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