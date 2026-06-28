/**
 * ContactCard.jsx — Editorial B&W contact card.
 * Black bordered card with email link, plain social text links.
 */
import { ArrowRight } from "lucide-react";
import { CONTACT } from "../data";

export default function ContactCard() {
  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-xl border-2 border-neutral-900 p-6 sm:p-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900">
            Contacts
          </h2>
          <span className="text-sm text-neutral-400 font-medium tracking-wide">
            {CONTACT.handle}
          </span>
        </div>

        {/* Email */}
        <a
          href={`mailto:${CONTACT.email}`}
          className="inline-flex items-center gap-2 text-neutral-900 text-[15px] font-semibold transition-colors group hover:text-neutral-500"
        >
          {CONTACT.email}
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </a>

        {/* Divider */}
        <hr className="divider-editorial my-5 opacity-20" />

        {/* Social links */}
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {CONTACT.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider font-medium"
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
