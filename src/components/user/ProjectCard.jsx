import React from "react";
import { NavLink } from "react-router";
import { FiArrowRight } from "react-icons/fi";

const ProjectCard = ({ project }) => {
  if (!project) return null;

  return (
    <div className="rounded-lg border border-[#DDE5E1] bg-[#F7FAF9] p-5 m-6">
      <h3 className="text-[15px] font-semibold text-[#17324D]">
        {project.title || "Untitled Project"}
      </h3>

      <p className="mt-2 text-xs text-[#64748B]">
        {project.industry || "General"} · {project.difficulty || "All Levels"}
      </p>

      <p className="mt-2 text-sm text-[#64748B]">
        {project.description || "No description provided."}
      </p>

      <div className="mt-3 flex items-center justify-between">
        {/* FORCED TO SHOW AVAILABLE */}
        <span className="rounded-full bg-[#D9F5E3] px-3 py-1 text-xs font-medium text-[#15803D]">
          Available
        </span>

        <NavLink
          to={`/project/${project.id}`}
          className="flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:underline"
        >
          View Project
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white">
            <FiArrowRight size={12} />
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default ProjectCard;