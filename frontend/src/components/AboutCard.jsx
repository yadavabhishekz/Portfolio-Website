/**
 * AboutCard.jsx — Editorial B&W about card.
 * Initials block on left, name/role/location/bio on right, tag pills.
 */
import { ABOUT } from "../data";

export default function AboutCard() {
  const initials = ABOUT.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-xl border-2 border-neutral-900 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Initials block */}
          <div className="shrink-0 flex justify-center sm:justify-start">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-neutral-900 flex items-center justify-center text-white heading-display text-6xl sm:text-7xl">
              {initials}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900">
              {ABOUT.name}
            </h2>
            <p className="label-editorial mt-2">
              {ABOUT.role}
            </p>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">
              {ABOUT.location}
            </p>

            <div className="mt-4">
              <p className="text-neutral-600 text-[15px] leading-relaxed">
                {ABOUT.bio}
              </p>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {ABOUT.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
