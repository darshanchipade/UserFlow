import type { ReactNode } from "react";

type StageHeroProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actionsSlot?: ReactNode;
};

export function StageHero({
  title,
  description,
  eyebrow = "Content Lake",
  actionsSlot,
}: StageHeroProps) {
  return (
    <section className="border-b border-slate-200 bg-[#f7f9fb]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white shadow-[0_10px_30px_rgba(15,23,42,0.2)]">
            
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              {eyebrow}
            </span>
            <span className="text-lg font-semibold text-slate-900">Content Lake</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
            {description && (
              <p className="text-base text-slate-500 lg:max-w-2xl">{description}</p>
            )}
          </div>
          {actionsSlot && (
            <div className="flex items-end justify-start lg:justify-end">{actionsSlot}</div>
          )}
        </div>
      </div>
    </section>
  );
}
