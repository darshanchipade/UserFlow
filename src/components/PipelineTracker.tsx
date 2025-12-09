"use client";

import {
  ArrowUpTrayIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

type StepId = "ingestion" | "extraction" | "cleansing" | "enrichment" | "qa";

type StepMeta = {
  id: StepId;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const STEPS: StepMeta[] = [
  { id: "ingestion", label: "Ingestion", icon: ArrowUpTrayIcon },
  { id: "extraction", label: "Extraction", icon: DocumentMagnifyingGlassIcon },
  { id: "cleansing", label: "Cleansing", icon: SparklesIcon },
  { id: "enrichment", label: "Enrichment", icon: BeakerIcon },
  { id: "qa", label: "Content QA", icon: ClipboardDocumentCheckIcon },
];

const statusStyles = {
  done: {
    circleBorder: "var(--primary-color)",
    circleBg: "var(--primary-soft)",
    iconColor: "var(--primary-color)",
    labelColor: "var(--primary-color)",
    connector: "var(--primary-color)",
  },
  current: {
    circleBorder: "var(--primary-color)",
    circleBg: "var(--primary-color)",
    iconColor: "#ffffff",
    labelColor: "var(--primary-color)",
    connector: "var(--primary-color)",
  },
  upcoming: {
    circleBorder: "var(--pipeline-muted)",
    circleBg: "#ffffff",
    iconColor: "#94a3b8",
    labelColor: "#94a3b8",
    connector: "var(--pipeline-muted)",
  },
};

export function PipelineTracker({ current }: { current: StepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);
  return (
    <nav className="w-full flex-col gap-3 text-xs">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((step, index) => {
            const status =
              index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
            const styles = statusStyles[status as keyof typeof statusStyles];
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 transition"
                    style={{
                      borderColor: styles.circleBorder,
                      backgroundColor: styles.circleBg,
                      color: styles.iconColor,
                    }}
                  >
                    <Icon className="size-5" style={{ color: styles.iconColor }} />
                  </div>
                  <span
                    className="text-[0.65rem] font-semibold uppercase tracking-wide"
                    style={{ color: styles.labelColor }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className="mx-2 hidden h-1 flex-1 rounded-full md:block"
                    style={{ backgroundColor: index < currentIndex ? styles.connector : statusStyles.upcoming.connector }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}