/**
 * ProjectDetailCard.jsx — Inline card for ONE project, shown when the AI
 * calls getProject(project_id). Falls back to the projects carousel if the
 * id is unknown.
 */
import { PROJECTS } from "../data";
import ProjectDetail from "./ProjectDetail";
import ProjectsCard from "./ProjectsCard";

export default function ProjectDetailCard({ toolArgs }) {
  const project = PROJECTS.find((p) => p.id === toolArgs?.project_id);
  if (!project) return <ProjectsCard />;

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-xl border-2 border-neutral-900 p-6 sm:p-8">
        <ProjectDetail project={project} />
      </div>
    </div>
  );
}
