"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearCleansedContext,
  loadCleansedContext,
  saveEnrichmentContext,
} from "@/lib/extraction-context";

const steps = ["Ingestion", "Extraction", "Cleansing", "Data Enrichment", "Content QA"];

type Feedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

const FeedbackPill = ({ feedback }: { feedback: Feedback }) => {
  if (feedback.state === "idle") return null;
  const className = clsx(
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
    feedback.state === "success"
      ? "bg-emerald-50 text-emerald-700"
      : feedback.state === "error"
        ? "bg-rose-50 text-rose-700"
        : "bg-indigo-50 text-indigo-600",
  );
  const Icon =
    feedback.state === "loading"
      ? ArrowPathIcon
      : feedback.state === "success"
        ? CheckCircleIcon
        : ExclamationCircleIcon;
  const message =
    feedback.message ??
    (feedback.state === "loading"
      ? "Contacting backend..."
      : feedback.state === "success"
        ? "Completed successfully."
        : "Something went wrong.");
  return (
    <div className={className}>
      <Icon className={clsx("size-4", feedback.state === "loading" && "animate-spin")} />
      {message}
    </div>
  );
};

const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleString();
};

export default function CleansedPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>({ state: "idle" });
  const [context, setContext] = useState(loadCleansedContext());
  const [search, setSearch] = useState("");
  const [sendingEnrichment, setSendingEnrichment] = useState(false);

  useEffect(() => {
    if (!context) {
      router.replace("/extraction");
    }
  }, [context, router]);

  const allItems = useMemo(() => {
    if (context?.items && context.items.length) {
      return context.items;
    }
    if (context?.rawBody) {
      try {
        const parsed = JSON.parse(context.rawBody);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.cleansedItems)) return parsed.cleansedItems;
        if (Array.isArray(parsed?.items)) return parsed.items;
      } catch {
        // ignore
      }
    }
    return [];
  }, [context]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const query = search.toLowerCase();
    return allItems.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query),
    );
  }, [allItems, search]);

  const sendToEnrichment = async () => {
    if (!context?.metadata.cleansedId) {
      setFeedback({
        state: "error",
        message: "Cleansed ID missing. Cannot trigger enrichment.",
      });
      return;
    }
    setSendingEnrichment(true);
    setFeedback({ state: "loading" });
    try {
      const response = await fetch("/api/ingestion/enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: context.metadata.cleansedId }),
      });
      const payload = await response.json();
      setFeedback({
        state: response.ok ? "success" : "error",
        message: response.ok
          ? "Enrichment pipeline started."
          : payload?.error ?? "Backend rejected the request.",
      });
      if (response.ok) {
        const now = Date.now();
        const existingHistory = context?.status
          ? [
              {
                status: context.status,
                timestamp: context.metadata.uploadedAt,
              },
            ]
          : [];

        saveEnrichmentContext({
          metadata: {
            ...context.metadata,
            status: "ENRICHMENT_REQUESTED",
          },
          items: context.items,
          startedAt: now,
          statusHistory: [
            ...existingHistory,
            {
              status: "ENRICHMENT_REQUESTED",
              timestamp: now,
            },
          ],
        });

        clearCleansedContext();
        router.push("/enrichment");
      }
    } catch (error) {
      setFeedback({
        state: "error",
        message:
          error instanceof Error ? error.message : "Failed to reach backend.",
      });
    } finally {
      setSendingEnrichment(false);
    }
  };

  if (!context) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No cleansed data available.</p>
          <p className="mt-2 text-sm text-slate-500">Return to Extraction and run cleansing first.</p>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cleansed items</p>
              <h1 className="text-xl font-semibold text-slate-900">Review cleansed content</h1>
            </div>
            <FeedbackPill feedback={feedback} />
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "rounded-full px-3 py-1",
                    index === 2
                      ? "bg-indigo-50 text-indigo-600"
                      : index < 2
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500",
                  )}
                >
                  {label}
                </span>
                {index < steps.length - 1 && <span className="text-slate-300">—</span>}
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
              <h2 className="text-lg font-semibold text-slate-900">Processing details</h2>
            </div>
            <button
              type="button"
              onClick={sendToEnrichment}
              disabled={sendingEnrichment}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white",
                sendingEnrichment && "cursor-not-allowed opacity-60",
              )}
            >
              {sendingEnrichment ? (
                <>
                  <ArrowPathIcon className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send to Enrichment"
              )}
            </button>
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Cleansed ID</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.metadata.cleansedId ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Source</dt>
              <dd className="text-sm font-semibold text-slate-900">{context.metadata.source}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Status</dt>
              <dd className="text-sm font-semibold text-slate-900">{context.status ?? "CLEANSED"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Completed</dt>
              <dd className="text-sm font-semibold text-slate-900">
                {formatDateTime(context.metadata.uploadedAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Cleansed items ({filteredItems.length})
            </h3>
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
              No cleansed items available.
            </div>
          ) : (
            <div className="mt-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
              {filteredItems.map((item, index) => (
                <CleansedCard key={index} item={item} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const CleansedCard = ({ item, index }: { item: unknown; index: number }) => {
  const record = (item ?? {}) as Record<string, unknown>;

  const getNestedValue = (target: unknown, path: string[]): unknown => {
    if (!target || typeof target !== "object") return undefined;
    let current: any = target;
    for (const segment of path) {
      if (current == null) return undefined;
      current = current[segment];
    }
    return current;
  };

  const pickValue = (paths: string[][]): unknown => {
    for (const path of paths) {
      const value =
        path.length === 1 ? record[path[0]] : getNestedValue(record, path);
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return undefined;
  };

  const formatValue = (value: unknown) => {
    if (value === undefined) return "—";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return JSON.stringify(value, null, 2);
  };

  const formatRules = (value: unknown) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((entry) => formatValue(entry))
        .filter((entry) => entry !== "—");
    }
    if (typeof value === "string") {
      return value
        .split(/[,|]/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [formatValue(value)];
  };

  const fieldName =
    (pickValue([
      ["fieldName"],
      ["originalFieldName"],
      ["itemType"],
      ["label"],
      ["name"],
      ["context", "fieldName"],
    ]) as string | undefined) ?? `Cleansed entry ${index + 1}`;

  const fieldPath =
    (pickValue([
      ["fieldPath"],
      ["path"],
      ["usagePath"],
      ["sourcePath"],
      ["context", "usagePath"],
    ]) as string | undefined) ?? "—";

  const originalValue =
    pickValue([
      ["originalValue"],
      ["original", "value"],
      ["original"],
      ["rawValue"],
      ["sourceValue"],
      ["valueBefore"],
      ["context", "originalValue"],
      ["context", "facets", "originalValue"],
      ["context", "facets", "rawValue"],
      ["context", "facets", "copy"],
      ["context", "facets", "analyticsText"],
      ["context", "facets", "analyticsTags"],
      ["context", "facets", "pageAnalytics"],
      ["context", "facets", "analytics"],
    ]) ?? pickValue([["context", "rawValue"], ["context", "facets"]]);

  const cleansedValue =
    pickValue([
      ["cleansedValue"],
      ["cleansedContent"],
      ["value"],
      ["standardizedValue"],
      ["content"],
      ["context", "facets", "cleansedCopy"],
      ["context", "facets", "copy"],
      ["context", "facets", "analyticsText"],
    ]) ?? record;

  const rulesValue =
    pickValue([
      ["rulesApplied"],
      ["rules"],
      ["transformations"],
      ["actions"],
      ["context", "rules"],
      ["context", "facets", "rules"],
      ["context", "facets", "transformations"],
    ]) ?? (record.skipEnrichment ? ["Skip enrichment flag"] : undefined);
  const rulesApplied = formatRules(rulesValue);

  return (
    <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Field</p>
          <h4 className="text-sm font-semibold text-slate-900">{fieldName}</h4>
          <p className="text-xs text-slate-500">{fieldPath}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          #{index + 1}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Original value
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {formatValue(originalValue)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Cleansed value
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
            {formatValue(cleansedValue)}
          </p>
        </div>
        <div className="md:col-span-2 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Rules applied
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
            {(rulesApplied.length ? rulesApplied : ["—"]).map((rule, ruleIndex) => (
              <span
                key={ruleIndex}
                className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700"
              >
                {rule}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};