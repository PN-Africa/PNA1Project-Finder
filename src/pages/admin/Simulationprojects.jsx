import { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiDownload } from "react-icons/fi";
import CreateProject from "./CreateProject";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });



const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);


const pick = (obj, ...keys) => {
  for (const k of keys) if (obj?.[k] != null && obj[k] !== "") return obj[k];
  return "";
};

const text = (v) =>
  Array.isArray(v)
    ? v
        .map((x) =>
          x && typeof x === "object"
            ? x.name
              ? x.name + (x.description && x.description !== x.name ? ` – ${x.description}` : "")
              : x.title ?? JSON.stringify(x)
            : x
        )
        .join("\n")
    : label(v);

const toRow = (p) => ({
  id: p.id,
  title: p.title ?? p.name ?? "Untitled project",
  industry: label(p.industry),
  difficulty: label(p.difficulty_level ?? p.difficulty ?? p.level),
  status: p.status ?? (p.is_published === false ? "Draft" : "Published"),
});

const select =
  "cursor-pointer rounded-lg bg-white px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 w-full md:w-auto";
const pill = "inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700";


function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
      Back to projects
    </button>
  );
}

function Block({ title, children }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-[#17304d]">{title}</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}



function ProjectDetail({ id, onBack }) {
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSim(await res.json());
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const brief = sim && pick(sim, "brief", "brief_url", "project_brief");
  const company = sim && pick(sim, "scenario_name", "company_name", "company");

  return (
    <section className="min-h-screen bg-[#edf3f1] p-5 text-[#17304d] sm:p-8">
      <div className="mx-auto max-w-4xl">
        <BackButton onClick={onBack} />

        {loading && <p className="text-[#7d8c99]">Loading project…</p>}
        {error && (
          <p className="text-red-700">
            Couldn't load this project. {error}{" "}
            <button type="button" onClick={load} className="underline">Try again</button>
          </p>
        )}

        {sim && (
          <div className="flex flex-col gap-5">
            <header>
              <h1 className="text-xl font-medium">{pick(sim, "title", "name") || "Untitled project"}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  label(sim.industry),
                  label(sim.difficulty_level ?? sim.difficulty ?? sim.level),
                  sim.duration_in_days ? `${sim.duration_in_days} days` : "",
                  label(sim.status),
                ]
                  .filter(Boolean)
                  .map((t) => (
                    <span key={t} className={pill}>{t}</span>
                  ))}
              </div>
              {company && <p className="mt-3 text-sm text-slate-500">{company}</p>}
            </header>

            <Block title="Scenario">{pick(sim, "scenario_description", "scenario", "description")}</Block>
            <Block title="Business problem">{pick(sim, "business_problem")}</Block>
            <Block title="Objective">{pick(sim, "objective", "project_objective")}</Block>
            <Block title="Stakeholders / team">{text(pick(sim, "stakeholders", "team"))}</Block>
            <Block title="Your role">{text(pick(sim, "professional_role", "role"))}</Block>
            <Block title="Tasks">{text(pick(sim, "tasks"))}</Block>
            <Block title="Required deliverables">{text(pick(sim, "deliverables", "required_deliverables"))}</Block>

            {brief && (
              <a
                href={brief}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 underline"
              >
                <FiDownload aria-hidden="true" className="h-4 w-4" />
                Download project brief
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


export default function SimulationProjects() {
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/projects/?page_size=100`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setProjects(list.map(toRow));
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (adding) {
    return (
      <CreateProject
        onBack={() => setAdding(false)}
        onCreated={() => {
          setAdding(false);
          load();
        }}
      />
    );
  }

  if (selectedId != null) {
    return <ProjectDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const industries = [...new Set(projects.map((p) => p.industry).filter(Boolean))];
  const difficulties = [...new Set(projects.map((p) => p.difficulty).filter(Boolean))];
  const shown = projects.filter(
    (p) => (!industry || p.industry === industry) && (!difficulty || p.difficulty === difficulty)
  );

  return (
    <section className="min-h-screen bg-[#edf3f1] p-5 text-[#17304d] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <h1 className="text-xl font-medium">Simulation Projects</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select aria-label="Filter by industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={select}>
              <option value="">Industry</option>
              {industries.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            <select aria-label="Filter by difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={select}>
              <option value="">Difficulty</option>
              {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" />
              Add project
            </button>
          </div>
        </div>

        {loading && <p className="text-[#7d8c99]">Loading projects…</p>}
        {error && (
          <p className="text-red-700">
            Couldn't load projects. {error}{" "}
            <button type="button" onClick={load} className="underline">Try again</button>
          </p>
        )}
        {!loading && !error && projects.length === 0 && (
          <p className="text-[#7d8c99]">No projects yet. Click “Add project” to create the first one.</p>
        )}
        {!loading && !error && projects.length > 0 && shown.length === 0 && (
          <p className="text-[#7d8c99]">No projects match these filters.</p>
        )}

        {shown.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead className="border-b border-gray-200 bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    {["Project", "Industry", "Difficulty", "Status"].map((h) => (
                      <th key={h} className="px-6 py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shown.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className="cursor-pointer text-sm text-slate-500 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-semibold text-[#17304d]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(p.id);
                          }}
                          className="text-left hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                          {p.title}
                        </button>
                      </td>
                      <td className="px-6 py-4">{p.industry || "—"}</td>
                      <td className="px-6 py-4">
                        {p.difficulty ? <span className={pill}>{p.difficulty}</span> : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            ["available", "active", "published"].includes(String(p.status).toLowerCase())
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}