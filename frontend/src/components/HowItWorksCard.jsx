/**
 * HowItWorksCard.jsx — Explains how this portfolio's AI works:
 * request pipeline, design decisions, and stack.
 */
import { ArrowRight, ChevronRight } from "lucide-react";
import { SITE_INFO } from "../data";

export default function HowItWorksCard() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-2">
        How This Site Works
      </h2>
      <p className="text-neutral-500 text-[15px] mb-8">
        Every message runs through a small RAG + tool-calling pipeline.
      </p>

      {/* Pipeline: horizontal on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row md:items-stretch gap-2 mb-8">
        {SITE_INFO.pipeline.map((step, idx) => (
          <div key={step.title} className="flex flex-col md:flex-row md:items-center gap-2 md:flex-1 min-w-0">
            <div className="flex-1 rounded-lg border-2 border-neutral-900 p-3 bg-white h-full">
              <p className="label-editorial text-neutral-400 mb-1">Step {idx + 1}</p>
              <p className="text-sm font-bold text-neutral-900 uppercase tracking-wide">{step.title}</p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{step.detail}</p>
            </div>
            {idx < SITE_INFO.pipeline.length - 1 && (
              <ArrowRight
                size={16}
                className="shrink-0 self-center text-neutral-400 rotate-90 md:rotate-0"
              />
            )}
          </div>
        ))}
      </div>

      {/* Design decisions */}
      <p className="label-editorial text-amber-700 mb-3">Design decisions</p>
      <ul className="border-l-2 border-neutral-900 pl-4 space-y-2 mb-8">
        {SITE_INFO.decisions.map((d) => (
          <li key={d} className="text-[15px] text-neutral-600 leading-relaxed">
            {d}
          </li>
        ))}
      </ul>

      {/* Stack */}
      <p className="label-editorial text-amber-700 mb-3">Stack</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {SITE_INFO.stack.map((t) => (
          <span key={t} className="skill-pill">
            {t}
          </span>
        ))}
      </div>

      <a
        href={SITE_INFO.repo}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group"
      >
        <span className="text-sm font-medium text-neutral-700">Source code on GitHub</span>
        <ChevronRight size={16} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" />
      </a>
    </div>
  );
}
