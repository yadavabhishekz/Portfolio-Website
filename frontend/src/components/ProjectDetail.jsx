/**
 * ProjectDetail.jsx — Full project write-up: overview, architecture,
 * engineering decisions, tech stack, screenshots, and links.
 * Shared by the ProjectsCard modal and the inline ProjectDetailCard.
 */
import { ChevronRight } from "lucide-react";

function SectionLabel({ children }) {
  return <p className="label-editorial text-amber-700 mb-3">{children}</p>;
}

export default function ProjectDetail({ project }) {
  return (
    <>
      {/* Category label */}
      <p className="label-editorial text-neutral-500 mb-1">{project.category}</p>

      {/* Title */}
      <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-5 pr-10">
        {project.title}
      </h2>

      {/* Date badge + Description */}
      <div className="bg-neutral-50 rounded-lg p-5 mb-6">
        <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 mb-3 tracking-wide">
          {project.date}
        </span>
        <p className="text-neutral-600 text-[15px] leading-relaxed">{project.description}</p>
      </div>

      {/* Architecture / how it works */}
      {project.architecture?.length > 0 && (
        <div className="mb-6">
          <SectionLabel>How it works</SectionLabel>
          <ol className="space-y-2.5">
            {project.architecture.map((step, idx) => (
              <li key={idx} className="flex gap-3 text-[15px] text-neutral-700 leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Engineering decisions & challenges */}
      {project.decisions?.length > 0 && (
        <div className="mb-6">
          <SectionLabel>Engineering decisions</SectionLabel>
          <ul className="border-l-2 border-neutral-900 pl-4 space-y-2">
            {project.decisions.map((d, idx) => (
              <li key={idx} className="text-[15px] text-neutral-600 leading-relaxed">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech stack */}
      <SectionLabel>Technologies</SectionLabel>
      <div className="flex flex-wrap gap-2 mb-6">
        {project.techStack.map((t) => (
          <span key={t} className="skill-pill">
            {t}
          </span>
        ))}
      </div>

      {/* Gallery: screenshots, diagrams, and real outputs */}
      {project.images?.length > 0 && (
        <div className="mb-6">
          <hr className="divider-editorial opacity-10 mb-5" />
          <SectionLabel>Gallery</SectionLabel>
          <div className="space-y-4">
            {project.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${project.title} screenshot ${idx + 1}`}
                loading="lazy"
                className="w-full rounded-lg border border-neutral-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {project.links?.length > 0 && (
        <div>
          <hr className="divider-editorial opacity-10 mb-5" />
          <SectionLabel>Links 🔗</SectionLabel>
          <div className="space-y-2">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group"
              >
                <span className="text-sm font-medium text-neutral-700">{link.label}</span>
                <ChevronRight
                  size={16}
                  className="text-neutral-400 group-hover:text-neutral-700 transition-colors"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
