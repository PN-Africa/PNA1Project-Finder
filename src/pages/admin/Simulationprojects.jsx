import { useCallback, useEffect, useState } from "react";
import CreateProject from "./CreateProject";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

const toRow = (p) => ({
  id: p.id,
  title: p.title ?? p.name ?? "Untitled project",
  industry: label(p.industry),
  difficulty: label(p.difficulty ?? p.level),
  status: p.status ?? "Available",
});

const select =
  "cursor-pointer rounded-lg bg-white px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600";

export default function SimulationProjects() {
  const [adding, setAdding] = useState(false);
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
      console.log("RAW admin projects response:", data); // remove once everything displays correctly
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
      <div className="bg-[#edf3f1]">
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="px-5 pt-5 text-sm text-blue-600 hover:underline sm:px-8"
        >
          ← Back to projects
        </button>
        <CreateProject onCreated={load} />
      </div>
    );
  }

  const industries = [...new Set(projects.map((p) => p.industry).filter(Boolean))];
  const difficulties = [...new Set(projects.map((p) => p.difficulty).filter(Boolean))];
  const shown = projects.filter(
    (p) => (!industry || p.industry === industry) && (!difficulty || p.difficulty === difficulty)
  );

  return (
    <section className="min-h-full bg-[#edf3f1] p-5 text-[#17304d] sm:p-8">
      <h1 className="mb-6 text-3xl font-semibold">Simulation Projects</h1>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <select aria-label="Filter by industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={select}>
            <option value="">Industry</option>
            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select aria-label="Filter by difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={select}>
            <option value="">Difficulty</option>
            {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add project
        </button>
      </div>

      {loading && <p className="text-[#7d8c99]">Loading projects…</p>}
      {error && <p className="text-red-700">Couldn't load projects. {error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="text-[#7d8c99]">No projects yet. Click “Add project” to create the first one.</p>
      )}
      {!loading && !error && projects.length > 0 && shown.length === 0 && (
        <p className="text-[#7d8c99]">No projects match these filters.</p>
      )}

      {shown.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr>
                {["Project", "Industry", "Difficulty", "Status"].map((h) => (
                  <th key={h} className="px-3 py-3.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="border-t border-[#c9d1d6] text-sm text-slate-500">
                  <td className="px-3 py-4 font-semibold text-[#17304d]">{p.title}</td>
                  <td className="px-3 py-4">{p.industry || "—"}</td>
                  <td className="px-3 py-4">{p.difficulty || "—"}</td>
                  <td className="px-3 py-4">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}