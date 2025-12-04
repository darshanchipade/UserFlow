"use client";

export default function EnrichmentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-20">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-400">Enrichment</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Enrichment overview coming soon
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          Once the cleansing pipeline finishes, this space will summarize AI enrichment
          progress and allow you to review generated insights. For now, use the Extraction
          view to trigger cleansing manually and monitor your uploads from the history panel.
        </p>
      </div>
    </div>
  );
}
