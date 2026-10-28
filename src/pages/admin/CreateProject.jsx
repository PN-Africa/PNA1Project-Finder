import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const FILE_FIELD = "brief";

const FALLBACK = {
  industries: [{ value: "technology", label: "Technology" }],
  difficulties: [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ],
  roles: [],
};

const toOptions = (list) =>
  (Array.isArray(list) ? list : []).map((o) =>
    Array.isArray(o)
      ? { value: o[0], label: o[1] ?? o[0] }
      : typeof o === "object"
      ? { value: o.value ?? o.id ?? o.name, label: o.label ?? o.name ?? o.display_name ?? o.value }
      : { value: o, label: o }
  );

function parseChoices(data) {
  const find = (re, fallback) => {
    const key = Object.keys(data ?? {}).find((k) => re.test(k));
    const found = key ? toOptions(data[key]) : [];
    return found.length ? found : fallback;
  };
  return {
    industries: find(/industr|categor/i, FALLBACK.industries),
    difficulties: find(/difficult|level/i, FALLBACK.difficulties),
    roles: find(/role|profession/i, FALLBACK.roles),
  };
}

const flattenErrors = (data, prefix = "") => {
  if (typeof data === "string") return [prefix ? `${prefix}: ${data}` : data];
  if (Array.isArray(data)) return data.flatMap((v, i) => flattenErrors(v, typeof v === "object" && v ? `${prefix}[${i + 1}]` : prefix));
  if (data && typeof data === "object")
    return Object.entries(data).flatMap(([k, v]) => flattenErrors(v, k === "detail" ? "" : prefix ? `${prefix}.${k}` : k));
  return [];
};

const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const toDeliverable = (line) => {
  const [name, ...rest] = line.split(/\s+[-–:]\s+|:\s+/);
  const n = name.trim();
  return { name: n, description: rest.join(" - ").trim() || n };
};

const empty = {
  title: "", industry: "", difficulty_level: "", scenario_name: "",
  scenario_description: "", business_problem: "", objective: "",
  stakeholders: "", professional_role: "", duration_in_days: "30",
  tasks: "", deliverables: "", is_published: true,
};

const select =
  "cursor-pointer rounded-lg bg-white px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 w-full md:w-auto";
const inputClass =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-2 block text-xs font-medium text-[#17304d]";

export default function CreateProject({ onBack, onCreated }) {
  const [choices, setChoices] = useState(parseChoices(null));
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/projects/choices/`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setChoices(parseChoices(data)))
      .catch(() => {});
  }, []);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const missing = [];
    if (!form.title.trim()) missing.push("Title is required");
    if (!form.industry) missing.push("Choose an industry");
    if (!form.difficulty_level) missing.push("Choose a difficulty");
    if (!form.scenario_description.trim()) missing.push("Scenario description is required");
    if (!(parseInt(form.duration_in_days, 10) > 0)) missing.push("Duration must be a positive number of days");
    if (file && file.size > 10 * 1024 * 1024) missing.push("The brief is larger than 10MB");
    if (missing.length) return setErrors(missing);

    const body = {
      title: form.title.trim(),
      scenario_name: form.scenario_name.trim(),
      scenario_description: form.scenario_description.trim(),
      business_problem: form.business_problem.trim(),
      objective: form.objective.trim(),
      professional_role: form.professional_role.trim(),
      duration_in_days: parseInt(form.duration_in_days, 10),
      industry: form.industry,
      difficulty_level: form.difficulty_level,
      stakeholders: form.stakeholders.split(/[\n,]/).map((x) => x.trim()).filter(Boolean),
      tasks: lines(form.tasks),
      deliverables: lines(form.deliverables).map(toDeliverable),
      is_published: form.is_published,
    };

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(
          res.status === 401 ? ["You're not logged in (401). Please sign in again."]
          : res.status === 403 ? ["Your account isn't allowed to create projects (403)."]
          : [`Could not create the project (${res.status}):`, ...flattenErrors(data)]
        );
        return;
      }

      
      if (file && data.id) {
        const fd = new FormData();
        fd.append(FILE_FIELD, file);
        const up = await fetch(`${API_BASE}/projects/${data.id}/`, {
          method: "PATCH",
          headers: authHeaders(),
          body: fd,
        }).catch(() => null);
        if (!up || !up.ok) window.alert("The project was created, but the brief file could not be uploaded.");
      }

      setForm(empty);
      setFile(null);
      onCreated?.();
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSaving(false);
    }
  };

  const field = (name, text, ph, { rows, type = "text" } = {}) => (
    <div key={name}>
      <label htmlFor={name} className={labelClass}>{text}</label>
      {rows ? (
        <textarea id={name} name={name} rows={rows} value={form[name]} onChange={set} placeholder={ph} className={inputClass} />
      ) : (
        <input id={name} name={name} type={type} value={form[name]} onChange={set} placeholder={ph} className={inputClass} />
      )}
    </div>
  );

  return (
    <section className="min-h-screen bg-[#edf3f1] p-5 text-[#17304d] sm:p-8">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600">
  <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
  Back to projects
</button>
        <h1 className="mb-8 text-xl font-medium">Create Simulation Project</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {field("title", "Project Title", "Enter project title")}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select aria-label="Industry" name="industry" value={form.industry} onChange={set} className={select}>
              <option value="">Industry</option>
              {choices.industries.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select aria-label="Difficulty" name="difficulty_level" value={form.difficulty_level} onChange={set} className={select}>
              <option value="">Difficulty</option>
              {choices.difficulties.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {field("scenario_name", "Company / Scenario Name", "Enter company or scenario name")}
          {field("scenario_description", "Scenario Description", "Describe the project scenario", { rows: 3 })}
          {field("business_problem", "Business Problem", "Describe the business problem", { rows: 3 })}
          {field("objective", "Project Objective", "Describe the project objective", { rows: 3 })}
          {field("stakeholders", "Stakeholders / Team (comma separated)", "e.g. CEO, Head of Product, Data Team")}

          <div>
            <label htmlFor="professional_role" className={labelClass}>Professional Role</label>
            {choices.roles.length ? (
              <select id="professional_role" name="professional_role" value={form.professional_role} onChange={set} className={select}>
                <option value="">Select professional role</option>
                {choices.roles.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input id="professional_role" name="professional_role" value={form.professional_role} onChange={set} placeholder="e.g. Data Analyst" className={inputClass} />
            )}
          </div>

          {field("duration_in_days", "Duration (days)", "30", { type: "number" })}
          {field("tasks", "Tasks (one per line)", "Enter assigned tasks, one per line", { rows: 4 })}
          {field("deliverables", "Required Deliverables (one per line, optional “Name - description”)", "Final report - A 10 page summary of findings", { rows: 3 })}

          <div>
            <label className={labelClass}>Project Brief (optional)</label>
            <div className="relative flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-8 text-center transition-colors hover:bg-gray-50">
              <input type="file" aria-label="Upload project brief" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" accept=".pdf,.doc,.docx,.xlsx" />
              <svg className="mb-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-sm font-medium">{file?.name || "Upload a document"}</span>
              <span className="mt-1 text-xs text-gray-400">PDF, DOCX or XLSX: Max 10MB</span>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" checked={form.is_published} onChange={set} />
            Publish immediately
          </label>

          {errors.length > 0 && (
            <ul role="alert" className="list-disc rounded-md border border-red-300 bg-red-100 py-2 pl-7 pr-3 text-sm text-red-800">
              {errors.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button type="button" onClick={onBack} className="w-full rounded-md border border-blue-500 bg-white px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 sm:w-auto">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="w-full rounded-md bg-[#2563EB] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              {saving ? "Saving…" : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}