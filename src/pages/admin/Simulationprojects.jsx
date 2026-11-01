import { useCallback, useEffect, useState } from "react";
import { FiLayout } from "react-icons/fi";
import CreateProject from "./CreateProject";
import SimulationDetail from "./SimulationDetail";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const toRow = (p) => ({
  id: p.id,
  title: p.title ?? p.name ?? "Untitled project",
  industry: label(p.industry),
  difficulty: label(p.difficulty_level ?? p.difficulty ?? p.level),
  is_published: p.is_published === true || String(p.status).toLowerCase() === "published",
  date: p.updated_at ?? p.created_at ?? p.date_created,
  status: (p.is_published === true || String(p.status).toLowerCase() === "published") ? "Published" : "Draft",
});

export default function SimulationProjects() {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/projects/?page_size=100`, { headers: authHeaders() });
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

  const togglePublish = async (project) => {
    setBusyId(project.id);
    const nextState = !project.is_published;
    
    try {
      
      let res = await fetch(`${API_BASE}/admin/projects/${project.id}/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ is_published: nextState }),
      });

      // If that fails, try status string
      if (!res.ok) {
        res = await fetch(`${API_BASE}/admin/projects/${project.id}/status/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ status: nextState ? "published" : "draft" }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || JSON.stringify(data) || "Failed to update status");
      }
      
      load(); 
    } catch (e) {
      alert(e.message || "Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/projects/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to delete project");
      }
      load();
    } catch (e) {
      alert(e.message || "Could not delete project");
    } finally {
      setBusyId(null);
    }
  };

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

  if (editingId != null) {
    return (
      <CreateProject
        id={editingId}
        onBack={() => setEditingId(null)}
        onCreated={() => {
          setEditingId(null);
          load();
        }}
      />
    );
  }

  if (selectedId != null) {
    return <SimulationDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-xl font-medium text-[#17304d]">Simulation Projects</h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-[#2563EB] px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Project
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading projects…</p>}
      {error && <p className="text-sm text-red-600">Couldn't load projects. {error}</p>}
      
      {!loading && !error && projects.length === 0 && (
        <p className="text-sm text-gray-500">No projects yet. Click “Create Project” to add one.</p>
      )}

      <div className="flex flex-col gap-6">
        {projects.map((p) => (
          <div key={p.id} className="flex flex-col justify-between gap-6 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center">
            
            {/* Left Side */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#2563EB]">
                <FiLayout className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#17304d]">{p.title}</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {p.industry || "No Industry"} &middot; {p.difficulty || "No Difficulty"}
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-start gap-4 md:items-end">
              
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                  p.is_published
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {p.status}
              </span>

              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {p.is_published ? "Published" : "Created"}
                </p>
                <p className="text-xs font-medium text-gray-700">{formatDate(p.date)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(p.id)}
                  className="rounded border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => togglePublish(p)}
                  disabled={busyId === p.id}
                  className="rounded bg-[#2563EB] px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {busyId === p.id ? "..." : p.is_published ? "Unpublish" : "Publish"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={busyId === p.id}
                  className="rounded bg-[#ef4444] px-4 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {busyId === p.id ? "..." : "Delete"}
                </button>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}