import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getProject, startSimulation } from "../../src/utils/simulation";

const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

const toProject = (p = {}) => ({
  ...p,
  title: p.title ?? p.name ?? "Untitled project",
  description: p.description ?? p.summary ?? "",
  industry: label(p.industry),
  difficulty: label(p.difficulty ?? p.level),
  status: p.status ?? "Available",
  validity: p.validity,
  scenario: p.scenario,
  objective: p.objective ?? p.objectives,
  tasks: p.tasks,
  deliverables: p.deliverables ?? p.required_deliverables,
});

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getProject(id);
        console.log("RAW project response:", data);
        if (!cancelled) setProject(toProject(data));
      } catch (e) {
        if (!cancelled) setLoadError(e.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStart = async () => {
    setStarting(true);
    setStartError("");
    try {
      const projectId = project.id ?? id;
      const sim = await startSimulation(projectId);

      
      const simId = sim?.id ?? sim?.simulation_id ?? sim?.pk;
      if (!simId) {
        console.error("startSimulation returned no id:", sim);
        setStartError(
          "Simulation was created but the backend didn't return an id. Check the API response."
        );
        return;
      }

      navigate(`/simulation/${simId}`);
    } catch (e) {
      // Common case: user already started this project.
      // Backend often returns 400 with a message like "already exists" or
      // "Simulation for this project already exists". In that case, we try
      // to fetch the existing simulation and navigate to it instead.
      const msg = e.message || "";
      const looksLikeDuplicate =
        /already|exists|duplicate/i.test(msg);

      if (looksLikeDuplicate) {
        try {
          const projectId = project.id ?? id;
          const res = await fetch(
            `https://project-finder-q5t2.onrender.com/api/simulations/?project=${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : data?.results ?? data?.data ?? [];
            const existing = list[0];
            if (existing?.id) {
              navigate(`/simulation/${existing.id}`);
              return;
            }
          }
        } catch (fetchErr) {
          console.error("Could not fetch existing simulation:", fetchErr);
        }
      }

      setStartError(msg || "Could not start the simulation. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading project…</div>;
  }

  if (loadError || !project) {
    return (
      <div className="p-6">
        <p>
          {loadError
            ? `Couldn't load this project. ${loadError}`
            : "Project not found."}
        </p>
        <Link to="/project-library" className="text-blue-600">
          Back to library
        </Link>
      </div>
    );
  }

  const available = String(project.status).toLowerCase() === "available";

  return (
    <div className="m-1 max-w-3xl p-5">
      <h1 className="text-2xl font-bold text-[#17324D]">{project.title}</h1>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {project.industry}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1">
          {project.difficulty}
        </span>
        <span
          className={`rounded-full px-3 py-1 ${
            available
              ? "bg-[#D9F5E3] text-[#15803D]"
              : "bg-slate-200 text-slate-500"
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
      <p className="mt-1 text-slate-600">
        {project.scenario || project.description}
      </p>

      {project.objective && (
        <>
          <h2 className="mt-6 font-semibold text-[#17324D]">Objective</h2>
          <p className="mt-1 text-slate-600">{project.objective}</p>
        </>
      )}

      {Array.isArray(project.tasks) && (
        <>
          <h2 className="mt-6 font-semibold text-[#17324D]">
            What you will do
          </h2>
          <ol className="mt-1 list-decimal pl-5 text-slate-600">
            {project.tasks.map((t, i) => (
              <li key={i}>{label(t) || String(t)}</li>
            ))}
          </ol>
        </>
      )}

      {Array.isArray(project.deliverables) && (
        <>
          <h2 className="mt-6 font-semibold text-[#17324D]">Deliverables</h2>
          <ul className="mt-1 list-disc pl-5 text-slate-600">
            {project.deliverables.map((d, i) => (
              <li key={i}>{label(d) || String(d)}</li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-10 flex flex-col items-start gap-4">
        {available ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="rounded-lg bg-[#2563EB] px-6 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start"}
          </button>
        ) : (
          <span className="rounded-lg bg-slate-200 px-6 py-2.5 font-semibold text-slate-500">
            Unavailable
          </span>
        )}

        {startError && (
          <p className="max-w-xl rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {startError}
          </p>
        )}

        <Link
          to="/project-library"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to library
        </Link>
      </div>
    </div>
  );
};

export default ProjectDetail;