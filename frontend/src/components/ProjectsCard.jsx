/**
 * ProjectsCard.jsx — Editorial B&W project carousel with dark cards.
 * Horizontal scroll, arrow navigation, modal detail view with overlay.
 */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ArrowRight, X } from "lucide-react";
import { PROJECTS } from "../data";

export default function ProjectsCard() {
  const scrollRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  function scrollBy(direction) {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  function closeModal() {
    setSelectedProject(null);
  }

  return (
    <div className="animate-fade-in-up">
      <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-6">
        My Projects
      </h2>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
      >
        {PROJECTS.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="project-card shrink-0 w-[260px] sm:w-[280px] h-[340px] rounded-xl text-left flex flex-col cursor-pointer overflow-hidden"
          >
            {/* Thumbnail image (optional) */}
            {project.image && (
              <div className="w-full h-36 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <span className="label-editorial text-neutral-500">
                  {project.category}
                </span>
                <h3 className="heading-display text-3xl text-white mt-1">
                  {project.title}
                </h3>
              </div>

              <div className="mt-auto">
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.techStack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2.5 py-1 rounded border border-neutral-600 text-neutral-300 uppercase tracking-wider font-medium"
                    >
                      {t}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="text-[10px] px-2.5 py-1 rounded border border-neutral-600 text-neutral-300 uppercase tracking-wider font-medium">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation arrows */}
      {PROJECTS.length > 2 && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => scrollBy("left")}
            className="w-9 h-9 rounded-full border-2 border-neutral-900 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy("right")}
            className="w-9 h-9 rounded-full border-2 border-neutral-900 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Modal overlay (portaled to body) ── */}
      {selectedProject && createPortal(
        <div
          className="project-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="project-modal-card animate-modal-in">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all bg-white z-10"
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Category label */}
            <p className="label-editorial text-neutral-500 mb-1">
              {selectedProject.category}
            </p>

            {/* Title */}
            <h2 className="heading-display text-4xl sm:text-5xl text-neutral-900 mb-5">
              {selectedProject.title}
            </h2>

            {/* Date badge + Description */}
            <div className="bg-neutral-50 rounded-lg p-5 mb-6">
              <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 mb-3 tracking-wide">
                {selectedProject.date}
              </span>
              <p className="text-neutral-600 text-[15px] leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            {/* Tech stack */}
            <p className="label-editorial text-amber-700 mb-3">Technologies</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedProject.techStack.map((t) => (
                <span key={t} className="skill-pill">
                  {t}
                </span>
              ))}
            </div>

            {/* Screenshots / Images */}
            {selectedProject.images && selectedProject.images.length > 0 && (
              <div className="mb-6">
                <hr className="divider-editorial opacity-10 mb-5" />
                <p className="label-editorial text-amber-700 mb-3">Screenshots</p>
                <div className="space-y-4">
                  {selectedProject.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${selectedProject.title} screenshot ${idx + 1}`}
                      className="w-full rounded-lg border border-neutral-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Demo Video */}
            {selectedProject.demoVideo && (
              <div className="mb-6">
                <hr className="divider-editorial opacity-10 mb-5" />
                <p className="label-editorial text-amber-700 mb-3">Demo</p>
                <div className="rounded-lg overflow-hidden border border-neutral-200">
                  <video
                    src={selectedProject.demoVideo}
                    controls
                    className="w-full"
                    poster={selectedProject.images?.[0]}
                  />
                </div>
              </div>
            )}

            {/* Divider */}
            <hr className="divider-editorial opacity-10 mb-5" />

            {/* Links */}
            {selectedProject.links && selectedProject.links.length > 0 && (
              <div>
                <p className="label-editorial text-amber-700 mb-3 flex items-center gap-1.5">
                  Links 🔗
                </p>
                <div className="space-y-2">
                  {selectedProject.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group"
                    >
                      <span className="text-sm font-medium text-neutral-700">
                        {link.label}
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-neutral-400 group-hover:text-neutral-700 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
