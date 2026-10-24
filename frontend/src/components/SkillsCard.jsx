/**
 * SkillsCard.jsx — Editorial B&W skills with bordered uppercase pills.
 * Grouped categories with icons, horizontal rule dividers.
 */
import { ScanEye, Gauge, Sparkles, Database, MessageSquare, Brain, BarChart3, Rocket, Code2 } from "lucide-react";
import { SKILLS } from "../data";

// Icon names used by SKILLS in data.js
const ICONS = { ScanEye, Gauge, Sparkles, Database, MessageSquare, Brain, BarChart3, Rocket };

export default function SkillsCard() {
  return (
    <div className="animate-fade-in-up">
      <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-8">
        Skills & Expertise
      </h2>

      <div className="space-y-8">
        {SKILLS.map((group, idx) => {
          const Icon = ICONS[group.icon] || Code2;
          return (
            <div key={group.category}>
              {idx > 0 && <hr className="divider-editorial mb-8 opacity-20" />}
              <div className="flex items-center gap-2.5 mb-4">
                <Icon size={18} className="text-neutral-900" strokeWidth={2.5} />
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  {group.category}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
