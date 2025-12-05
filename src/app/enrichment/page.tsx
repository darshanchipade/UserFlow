"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PipelineTracker } from "@/components/PipelineTracker";

type Feedback = {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
};

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
