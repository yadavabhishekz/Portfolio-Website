/**
 * ContactCard.jsx — Soft gray contact panel: heading + handle, email link,
 * and a single row of plain social links.
 */
import { ChevronRight } from "lucide-react";
import { CONTACT } from "../data";

export default function ContactCard() {
  return (
    <div className="animate-fade-in-up">
      <div className="bg-neutral-100 rounded-3xl px-7 py-8 sm:px-14 sm:py-12">
        {/* Header row */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-7">
          <h2 className="heading-display text-5xl sm:text-6xl text-neutral-900">Contacts</h2>
          <span className="text-[15px] text-neutral-900 font-medium">{CONTACT.handle}</span>
        </div>

        {/* Email */}
        <a
          href={`mailto:${CONTACT.email}`}
          className="group inline-flex items-center gap-1.5 max-w-full text-base sm:text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span className="min-w-0 break-words">{CONTACT.email}</span>
          <ChevronRight
            size={20}
            strokeWidth={2.5}
            className="shrink-0 group-hover:translate-x-1 transition-transform"
          />
        </a>

        {/* Social links */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6">
          {CONTACT.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
