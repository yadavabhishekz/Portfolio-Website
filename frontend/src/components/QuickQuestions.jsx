/**
 * QuickQuestions.jsx — Editorial B&W quick question pills with hide toggle.
 * Black bordered pills with monochrome icons, clock button.
 */
import { useState } from "react";
import { Smile, Briefcase, Layers, Building2, FileText, Users, Clock, ChevronDown, ChevronUp } from "lucide-react";

const QUESTIONS = [
  { label: "Me", icon: Smile, query: "Tell me about yourself" },
  { label: "Projects", icon: Briefcase, query: "Show me your projects" },
  { label: "Skills", icon: Layers, query: "What are your skills?" },
  { label: "Experience", icon: Building2, query: "Tell me about your work experience" },
  { label: "Resume", icon: FileText, query: "Can I see your resume?" },
  { label: "Contact", icon: Users, query: "How can I contact you?" },
];

export default function QuickQuestions({ onSend, disabled, activeLabel }) {
  const [visible, setVisible] = useState(true);

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

      {/* Pills */}
      {visible && (
        <div className="flex items-center justify-center gap-2 flex-nowrap overflow-x-auto hide-scrollbar animate-fade-in px-4">
          {QUESTIONS.map((q) => {
            const Icon = q.icon;
            const isActive = activeLabel === q.label;
            return (
              <button
                key={q.label}
                onClick={() => !disabled && onSend(q.query, q.label)}
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
                <Icon size={15} strokeWidth={2.5} />
                {q.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
