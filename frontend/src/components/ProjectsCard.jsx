/**
 * ProjectsCard.jsx — Editorial B&W project carousel with white thumbnail cards.
 * Horizontal scroll, arrow navigation, modal detail view with overlay.
 */
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PROJECTS } from "../data";
import ProjectDetail from "./ProjectDetail";
import useModal from "../useModal";

export default function ProjectsCard() {
  const scrollRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Lock body scroll and close on Escape while the modal is open
  useModal(Boolean(selectedProject), () => setSelectedProject(null));

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
      {/* pt-2 leaves room for the hover lift inside the scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pt-2 pb-2"
      >
        {PROJECTS.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="project-card shrink-0 w-[260px] sm:w-[280px] rounded-xl text-left flex flex-col cursor-pointer overflow-hidden"
          >
            {/* Thumbnail: image when available, otherwise a text cover */}
            <div className="w-full h-36 shrink-0 overflow-hidden border-b-2 border-neutral-900">
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="project-cover-text w-full h-full flex items-center justify-center">
                  <span className="heading-display text-4xl text-neutral-900">
                    {project.coverText}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <span className="label-editorial text-neutral-500">
                {project.category}
              </span>
              <h3 className="heading-display text-3xl text-neutral-900 mt-1">
                {project.title}
              </h3>

              <div className="mt-3 flex flex-col flex-1">
                <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                  {project.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                  {project.techStack.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2.5 py-1 rounded border border-neutral-300 text-neutral-700 uppercase tracking-wider font-medium"
                    >
                      {t}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="text-[10px] px-2.5 py-1 rounded border border-neutral-300 text-neutral-700 uppercase tracking-wider font-medium">
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
            aria-label="Scroll projects left"
            className="w-9 h-9 rounded-full border-2 border-neutral-900 flex items-center justify-center text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scrollBy("right")}
            aria-label="Scroll projects right"
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
          <div
            className="project-modal-card animate-modal-in"
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-all bg-white z-10"
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <ProjectDetail project={selectedProject} />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
