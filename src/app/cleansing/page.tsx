"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadCleansedContext,
  clearCleansedContext,
  type CleansedContext,
} from "@/lib/extraction-context";

export default function CleansingPage() {
  const router = useRouter();
  const [context, setContext] = useState<CleansedContext | null>(null);

  useEffect(() => {
    setContext(loadCleansedContext());
  }, []);

  const itemsPreview = useMemo(() => context?.items?.slice(0, 10) ?? [], [context]);

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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Cleansing</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Review cleansed output ({context.metadata.name})
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/enrichment")}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Continue to Enrichment
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {context.status ?? "Pending"}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Uploaded</p>
              <p className="font-semibold text-slate-800">
                {new Date(context.metadata.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Items cached
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.items?.length ?? 0}
                {context.itemsTruncated && "+"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">
                Snapshot status
              </dt>
              <dd className="text-sm font-semibold text-slate-900">
                {context.fallbackReason === "quota" ? "Partial cache" : "Complete"}
              </dd>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Items</p>
              <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
            </div>
            {context.itemsTruncated && (
              <span className="text-xs font-semibold text-amber-600">
                Showing first {itemsPreview.length} items
              </span>
            )}
          </div>

          {itemsPreview.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
              No cleansed items available yet.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {itemsPreview.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <pre className="max-h-52 overflow-y-auto text-sm text-slate-800">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Next steps</p>
              <h2 className="text-lg font-semibold text-slate-900">
                Ready for enrichment?
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/extraction")}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Back to Extraction
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCleansedContext();
                  router.push("/ingestion");
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
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
