/**
 * ExperienceCard.jsx — Editorial B&W experience card.
 * Displays work experience entries with role, company, duration,
 * description, and tech stack pills. Follows the SkillsCard pattern.
 */
import { Building2, MapPin, Calendar } from "lucide-react";
import { EXPERIENCE } from "../data";

export default function ExperienceCard() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-8">
        Experience
      </h2>

      <div className="space-y-8">
        {EXPERIENCE.map((exp, idx) => (
          <div key={exp.id}>
            {idx > 0 && <hr className="divider-editorial mb-8 opacity-20" />}

            {/* Role & Company */}
            <div className="mb-3">
              <h3 className="heading-display text-2xl sm:text-3xl text-neutral-900">
                {exp.role}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
                  <Building2 size={14} strokeWidth={2.5} />
                  {exp.company}
                </span>
                {exp.team && (
                  <span className="text-xs text-neutral-400 font-medium">
                    — {exp.team}
                  </span>
                )}
              </div>
            </div>

            {/* Duration & Location */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
              <span className="inline-flex items-center gap-1.5 label-editorial">
                <Calendar size={12} strokeWidth={2.5} />
                {exp.duration}
              </span>
              {exp.location && (
                <span className="inline-flex items-center gap-1.5 label-editorial text-neutral-400">
                  <MapPin size={12} strokeWidth={2.5} />
                  {exp.location}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="border-l-2 border-neutral-900 pl-4 mb-5">
              <p className="text-neutral-600 text-[15px] leading-relaxed">
                {exp.description}
              </p>
            </div>

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-2">
              {exp.techStack.map((tech) => (
                <span key={tech} className="skill-pill">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
