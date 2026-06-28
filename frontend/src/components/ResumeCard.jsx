/**
 * ResumeCard.jsx — Full-width resume card.
 * Clicking the card downloads the resume PDF directly.
 */
import { RESUME } from "../data";

export default function ResumeCard() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-6">
        My Resume
      </h2>

      <a
        href={`/${RESUME.fileName}`}
        download
        className="block w-full rounded-xl overflow-hidden cursor-pointer no-underline relative group border border-neutral-900 max-h-[66vh]"
      >
        {RESUME.image ? (
          <>
            <img
              src={RESUME.image}
              alt="Resume"
              className="w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            {/* Bottom fade overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent 35%, white 100%)" }}
            />
          </>
        ) : (
          <div className="w-full h-[500px] bg-white flex items-center justify-center text-neutral-400 text-sm">
            Resume image goes here
          </div>
        )}
      </a>
    </div>
  );
}
