import React from "react";
import { useParams, Link } from "react-router";
import { projectData } from "../data";

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectData.find((p) => String(p.id) === id);

  if (!project) {
    return (
      <div className="p-6">
        <p>Project not found.</p>
        <Link to="/project-library" className="text-blue-600">
          Back to library
        </Link>
      </div>
    );
  }

  const available = project.status === "Available";

  return (
    <div className="m-1 max-w-3xl p-5">
      <h1 className="text-2xl font-bold text-[#17324D]">{project.title}</h1>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1">{project.industry}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">{project.difficulty}</span>
        <span
          className={`rounded-full px-3 py-1 ${
            available ? "bg-[#D9F5E3] text-[#15803D]" : "bg-slate-200 text-slate-500"
          }`}
        >
          {project.status}
        </span>
        {project.validity && (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Valid for {project.validity}
          </span>
        )}
      </div>

      <h2 className="mt-6 font-semibold text-[#17324D]">Overview</h2>
      <p className="mt-1 text-slate-600">{project.scenario || project.description}</p>

      {project.objective && (
        <>
          <h2 className="mt-6 font-semibold text-[#17324D]">Objective</h2>
          <p className="mt-1 text-slate-600">{project.objective}</p>
        </>
      )}

      {Array.isArray(project.tasks) && (
        <>
          <h2 className="mt-6 font-semibold text-[#17324D]">What you will do</h2>
          <ol className="mt-1 list-decimal pl-5 text-slate-600">
            {project.tasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </>
      )}

      {Array.isArray(project.deliverables) && (
        <>
          <h2 className="mt-6 font-semibold text-[#17324D]">Deliverables</h2>
          <ul className="mt-1 list-disc pl-5 text-slate-600">
            {project.deliverables.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10 flex flex-col items-start gap-4">
        {available ? (
          <Link
            to={"/simulation/" + project.id}
            className="rounded-lg bg-[#2563EB] px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Start
          </Link>
        ) : (
          <span className="rounded-lg bg-slate-200 px-6 py-2.5 font-semibold text-slate-500">
            Unavailable
          </span>
        )}

        <Link to="/project-library" className="text-blue-600 hover:underline">
          &larr; Back to library
        </Link>
      </div>
    </div>
  );
};

export default ProjectDetail;