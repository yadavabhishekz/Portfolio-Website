/**
 * QuickQuestions.jsx — Editorial B&W quick question pills with hide toggle.
 * Black bordered pills with monochrome icons. Questions come from data.js.
 */
import { useState } from "react";
import { Smile, Briefcase, Layers, Building2, Users, Ellipsis, ChevronDown, ChevronUp } from "lucide-react";
import { QUICK_QUESTIONS } from "../data";
import MorePromptsSheet from "./MorePromptsSheet";

// Icon names used by QUICK_QUESTIONS in data.js
const ICONS = { Smile, Briefcase, Layers, Building2, Users };

// `inChat`: the chat screen also shows chat-only pills and the "⋯" button (which holds the resume)
export default function QuickQuestions({ onSend, disabled, activeLabel, inChat = false }) {
  const [visible, setVisible] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-1.5 mx-auto text-xs text-neutral-400 hover:text-neutral-700 transition-colors font-medium tracking-wide"
      >
        {visible ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        {visible ? "Hide quick questions" : "Show quick questions"}
      </button>

      {/* Pills — on mobile a single row centered with mx-auto (not justify-center), so it
          overflows to the right and stays fully scrollable; from sm up the pills wrap */}
      {visible && (
        <div className="overflow-x-auto hide-scrollbar animate-fade-in">
          <div className="flex items-center gap-2 w-max mx-auto px-4 sm:w-auto sm:flex-wrap sm:justify-center">
            {QUICK_QUESTIONS.filter((q) => inChat || !q.chatOnly).map((q) => {
              const Icon = ICONS[q.icon];
              const isActive = activeLabel === q.label;
              return (
                <button
                  key={q.label}
                  onClick={() => !disabled && onSend(q.question, q.label)}
                  disabled={disabled}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5
                    rounded-full border-2 text-sm font-semibold
                    transition-all duration-200 uppercase tracking-wider whitespace-nowrap
                    ${
                      isActive
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                    }
                    disabled:opacity-30 disabled:cursor-not-allowed
                  `}
                >
                  {Icon && <Icon size={15} strokeWidth={2.5} />}
                  {q.label}
                </button>
              );
            })}

            {/* More suggested questions (chat screen only) */}
            {inChat && (
              <button
                onClick={() => setMoreOpen(true)}
                disabled={disabled}
                aria-label="More questions you can ask"
                title="More questions"
                className="inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Ellipsis size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      )}

      <MorePromptsSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onPick={(prompt) => {
          setMoreOpen(false);
          // Suggested prompts are history-free, so they go through the cached path
          onSend(prompt, prompt);
        }}
      />
    </div>
  );
}
