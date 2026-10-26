import { useEffect, useState } from "react";
import ProjectCard from "../components/user/ProjectCard";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const itemPerPage = 3;

const selectStyle =
  "rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#1E293B] focus:border-[#2563EB] focus:outline-none";

const pageBtn =
  "rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm text-[#475569] hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40";

// If the backend sends an object (e.g. industry: { id, name }), pull out a readable string
const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

// Keeps every backend field (...x) and adds the names the old mock data used,
// so ProjectCard keeps working. Several possible backend names are tried.
const toProject = (x) => ({
  ...x,
  id: x.id,
  title: x.title ?? x.name ?? x.project_title ?? "Untitled project",
  description: x.description ?? x.summary ?? "",
  industry: label(x.industry),
  difficulty: label(x.difficulty ?? x.level),
});

const ProjectLibary = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/projects/available/?page_size=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        console.log("RAW projects response:", data); // remove once everything displays correctly
        const list = Array.isArray(data) ? data : data.results ?? [];
        if (!cancelled) setProjects(list.map(toProject));
      } catch (e) {
        if (!cancelled) setError(e.message || "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchIndustry = industry === "" || p.industry === industry;
    const matchDifficulty = difficulty === "" || p.difficulty === difficulty;
    return matchIndustry && matchDifficulty;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemPerPage);
  const startIndex = (currentPage - 1) * itemPerPage;
  const currentProjects = filteredProjects.slice(startIndex, startIndex + itemPerPage);

  return (
    <div>
      <div>
        <h1 className="m-2 p-4 text-2xl font-bold text-[#17324D]">Explore Project</h1>
        <p className="p-5 text-black text-[18px] font-semi-bold">Filter By</p>

        <div className="flex flex-wrap gap-3 p-5 m-2">
          <select
            className={selectStyle}
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Industry</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="FinTech">FinTech</option>
            <option value="E-commerce">E-Commerce</option>
            <option value="Real Estate">Real Estate</option>
            <option value="EdTech">EdTech</option>
          </select>

          <select
            className={selectStyle}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <h3 className="p-4 text-black font-bold">Available Projects</h3>

      {loading && <p className="p-4 text-slate-500">Loading projects…</p>}
      {error && (
        <p className="p-4 text-red-700">Couldn't load projects. {error}</p>
      )}

      {!loading && !error && currentProjects.length === 0 && (
        <p className="p-4 text-black">No projects match your filters.</p>
      )}

      {!loading &&
        !error &&
        currentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} className="p-4" />
        ))}

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-4 ">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={pageBtn}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`h-9 w-9 rounded-lg text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-[#2563EB] text-white"
                  : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9]"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectLibary;