/**
 * MorePromptsSheet.jsx — Bottom sheet with suggested questions, grouped by
 * topic. Opened from the "⋯" button next to the quick-question pills.
 * The first prompt of each section is highlighted.
 */
import { createPortal } from "react-dom";
import {
  UserRound, Briefcase, FolderGit2, Layers, Cpu, Mail,
  Sparkles, ChevronRight, X, FileDown,
} from "lucide-react";
import { PROMPT_LIBRARY } from "../data";
import useModal from "../useModal";

// Icon names used by PROMPT_LIBRARY in data.js
const ICONS = { UserRound, Briefcase, FolderGit2, Layers, Cpu, Mail };

const RESUME_QUESTION = "Can I see your resume?";

export default function MorePromptsSheet({ open, onClose, onPick }) {
  useModal(open, onClose);
  if (!open) return null;

  return createPortal(
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sheet-panel animate-sheet-in"
        role="dialog"
        aria-modal="true"
        aria-label="More questions you can ask"
      >
        {/* Handle + close */}
        {/* Taller on phones so the close button never overlaps the resume banner */}
        <div className="sticky top-0 z-10 bg-white pt-3 pb-11 sm:pb-4 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-3 w-9 h-9 rounded-full border-2 border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 sm:px-8 pb-10 max-w-xl mx-auto">
          {/* Resume — pinned first and styled to be the first thing the eye lands on */}
          <button
            onClick={() => onPick(RESUME_QUESTION)}
            className="group w-full flex items-center gap-4 p-5 mb-9 rounded-2xl bg-neutral-900 text-white text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-4 ring-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            <span className="shrink-0 w-12 h-12 rounded-xl bg-white text-neutral-900 flex items-center justify-center">
              <FileDown size={24} strokeWidth={2.25} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block heading-display text-3xl leading-none">My Resume</span>
              <span className="block text-sm text-neutral-300 mt-1.5">View and download it as a PDF</span>
            </span>
            <ChevronRight size={22} className="shrink-0 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="label-editorial text-neutral-500 mb-6">Not sure what to ask? Pick one.</p>

          <div className="space-y-9">
            {PROMPT_LIBRARY.map((section) => {
              const Icon = ICONS[section.icon];
              return (
                <section key={section.title}>
                  <div className="flex items-center gap-2.5 pb-3 mb-4 border-b-2 border-neutral-900">
                    {Icon && <Icon size={20} strokeWidth={2.25} className="text-neutral-900" />}
                    <h3 className="heading-display text-3xl text-neutral-900">{section.title}</h3>
                  </div>
                  <div className="space-y-2.5">
                    {section.prompts.map((prompt, idx) => {
                      const featured = idx === 0;
                      return (
                        <button
                          key={prompt}
                          onClick={() => onPick(prompt)}
                          className={`
                            w-full flex items-center gap-3 px-5 py-4 rounded-xl text-left text-[15px] transition-colors group
                            ${
                              featured
                                ? "bg-neutral-900 text-white font-semibold hover:bg-neutral-700"
                                : "bg-neutral-50 border border-neutral-200 text-neutral-800 hover:border-neutral-900"
                            }
                          `}
                        >
                          {featured && <Sparkles size={16} strokeWidth={2.25} className="shrink-0" />}
                          <span className="flex-1">{prompt}</span>
                          <ChevronRight
                            size={18}
                            className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                              featured ? "text-white" : "text-neutral-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
