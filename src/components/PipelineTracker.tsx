"use client";

import clsx from "clsx";

type StepId = "ingestion" | "extraction" | "cleansing" | "enrichment" | "qa";

const STEPS: Array<{ id: StepId; label: string }> = [
  { id: "ingestion", label: "Ingestion" },
  { id: "extraction", label: "Extraction" },
  { id: "cleansing", label: "Cleansing" },
  { id: "enrichment", label: "Data Enrichment" },
];

export function PipelineTracker({ current }: { current: StepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav className="hidden flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 md:flex">
      {STEPS.map((step, index) => {
        const status =
          index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return (
          <div key={step.id} className="flex items-center gap-2">
            <span
              className={clsx(
                "rounded-full px-3 py-1 transition",
                status === "current"
                  ? "bg-indigo-50 text-indigo-600"
                  : status === "done"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500",
              )}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && <span className="text-slate-300">—</span>}
          </div>
        );
      })}
    </nav>
  );
}
