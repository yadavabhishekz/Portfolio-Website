/**
 * HelpModal.jsx — Welcome / help window opened from the permanent ⓘ button.
 * Explains what the portfolio is, why it's a chat, and how to use it.
 */
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import useModal from "../useModal";

export default function HelpModal({ open, onClose, onHowItWorks, onContact }) {
  useModal(open, onClose);
  if (!open) return null;

  return createPortal(
    <div
      className="project-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="project-modal-card modal-narrow animate-modal-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <h2 id="help-title" className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-6 pr-12">
          Welcome to my AI portfolio
        </h2>

        <div className="bg-neutral-50 rounded-xl p-6 sm:p-7 space-y-6 text-[15px] leading-relaxed text-neutral-700">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">What&apos;s this?</h3>
            <p>
              My portfolio, built as an <strong className="text-neutral-900">AI you can talk to</strong>. Ask
              anything about my projects, my work, or how I think, and I&apos;ll answer in my own voice and pull
              up the right card for it. Recruiter, engineer, or just curious — you&apos;re in the right place.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Why?</h3>
            <p>
              Traditional portfolios show everyone the same page, but a recruiter, an engineer, and a friend each
              want something different. Here you get{" "}
              <strong className="text-neutral-900">exactly what you&apos;re interested in</strong>. And since I
              build AI systems, it felt right to show that instead of just listing it.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Tips</h3>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-neutral-400">
              <li>Tap a quick question under the chat box, or <strong className="text-neutral-900">⋯</strong> for more ideas.</li>
              <li>Ask follow-ups — like &ldquo;which vector database did it use?&rdquo;</li>
              <li>Ask anything — projects, skills, experience, or how this site was built.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center mt-7">
          <button
            onClick={onClose}
            className="px-7 py-3 rounded-full bg-neutral-900 text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-700 transition-colors"
          >
            Start chatting
          </button>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Curious how it&apos;s built?{" "}
          <button onClick={onHowItWorks} className="underline underline-offset-2 text-neutral-900 hover:text-neutral-500">
            See how this site works
          </button>
          . Feedback is always welcome —{" "}
          <button onClick={onContact} className="underline underline-offset-2 text-neutral-900 hover:text-neutral-500">
            contact me
          </button>
          .
        </p>
      </div>
    </div>,
    document.body
  );
}
