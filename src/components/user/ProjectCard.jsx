import React from 'react'
import { projectData } from "../../data";       
import { NavLink } from "react-router"; 
import { LuDot } from "react-icons/lu";
import { FiArrowRight } from "react-icons/fi";


const ProjectCard = ({ project }) => {
  return (
    <div className="rounded-lg border border-[#DDE5E1] bg-[#F7FAF9] p-5 m-6">
      <h3 className="text-[15px] font-semibold text-[#17324D]">{project.title}</h3>

      <p className="mt-2 text-xs text-[#64748B]">
        {project.industry} · {project.difficulty}
      </p>

      <p className="mt-2 text-sm text-[#64748B]">{project.description}</p>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            project.status === "Available"
              ? "bg-[#D9F5E3] text-[#15803D]"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {project.status}
        </span>
<NavLink
  to={"/project/" + project.id}
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