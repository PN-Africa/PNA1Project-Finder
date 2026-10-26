import { useEffect, useState } from "react";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Used only if GET /api/projects/choices/ can't be read
const FALLBACK = {
  industries: ["Technology", "Healthcare", "FinTech", "E-commerce", "Real Estate", "EdTech"],
  difficulties: ["Beginner", "Intermediate", "Advanced"],
};

// Turns any common "choices" shape into [{ value, label }]
const toOptions = (list) =>
  (Array.isArray(list) ? list : []).map((o) =>
    Array.isArray(o)
      ? { value: o[0], label: o[1] ?? o[0] }
      : typeof o === "object"
      ? { value: o.value ?? o.id ?? o.name, label: o.label ?? o.name ?? o.display_name ?? o.value }
      : { value: o, label: o }
  );

function parseChoices(data) {
  const find = (re) => {
    const key = Object.keys(data ?? {}).find((k) => re.test(k));
    return key ? toOptions(data[key]) : [];
  };
  const industries = find(/industr|categor/i);
  const difficulties = find(/difficult|level/i);
  return {
    industries: industries.length ? industries : toOptions(FALLBACK.industries),
    difficulties: difficulties.length ? difficulties : toOptions(FALLBACK.difficulties),
  };
}

// { title: ["This field is required."] } -> ["title: This field is required."]
const flattenErrors = (data) =>
  typeof data === "string"
    ? [data]
    : Object.entries(data ?? {}).flatMap(([k, v]) =>
        [].concat(v).map((m) => (k === "detail" ? String(m) : `${k}: ${typeof m === "string" ? m : JSON.stringify(m)}`))
      );

const lines = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean);

const empty = {
  title: "", industry: "", difficulty: "", description: "",
  scenario: "", business_problem: "", objective: "",
  tasks: "", deliverables: "", validity_days: "",
};

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20";

const Field = ({ label, hint, children }) => (
  <label className="mt-5 block">
    <span className="text-sm font-semibold text-[#17304d]">{label}</span>
    {hint && <span className="ml-2 text-xs text-[#7d8c99]">{hint}</span>}
    <div className="mt-1.5">{children}</div>
  </label>
);

export default function CreateProject({ onCreated }) {
  const [choices, setChoices] = useState(parseChoices(null));
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/projects/choices/`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        console.log("RAW choices response:", data); // remove once the dropdowns look right
        setChoices(parseChoices(data));
      })
      .catch(() => {}); // keeps the fallback options
  }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess("");

    const missing = [];
    if (!form.title.trim()) missing.push("Title is required");
    if (!form.industry) missing.push("Choose an industry");
    if (!form.difficulty) missing.push("Choose a difficulty");
    if (missing.length) return setErrors(missing);

    // optional fields are only sent when filled in
    const body = { title: form.title.trim(), industry: form.industry, difficulty: form.difficulty };
    ["description", "scenario", "business_problem", "objective"].forEach((k) => {
      if (form[k].trim()) body[k] = form[k].trim();
    });
    if (form.tasks.trim()) body.tasks = lines(form.tasks);
    if (form.deliverables.trim()) body.deliverables = lines(form.deliverables);
    if (form.validity_days) body.validity_days = Number(form.validity_days);

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(res.status === 403 ? ["Your account isn't allowed to create projects (403)."] : flattenErrors(data));
        return;
      }
      setSuccess(`"${form.title.trim()}" was added. It will now show in the Project Library.`);
      setForm(empty);
      onCreated?.(); // lets the list page refresh itself
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-full bg-[#edf3f1] p-5 text-[#17304d] sm:p-8">
      <h1 className="mb-2 text-3xl font-semibold">Add project</h1>
      <p className="text-sm text-[#7d8c99]">Add a project. It appears in the user library under its industry and difficulty.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 max-w-2xl">
        <Field label="Title">
          <input name="title" value={form.title} onChange={set} className={input} placeholder="e.g. Healthcare Improvement Process" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Industry">
            <select name="industry" value={form.industry} onChange={set} className={input}>
              <option value="">Select industry</option>
              {choices.industries.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select name="difficulty" value={form.difficulty} onChange={set} className={input}>
              <option value="">Select difficulty</option>
              {choices.difficulties.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Description" hint="optional">
          <textarea name="description" rows={2} value={form.description} onChange={set} className={input} />
        </Field>
        <Field label="Scenario" hint="optional">
          <textarea name="scenario" rows={3} value={form.scenario} onChange={set} className={input} />
        </Field>
        <Field label="Business problem" hint="optional">
          <textarea name="business_problem" rows={2} value={form.business_problem} onChange={set} className={input} />
        </Field>
        <Field label="Objective" hint="optional">
          <textarea name="objective" rows={2} value={form.objective} onChange={set} className={input} />
        </Field>
        <Field label="Tasks" hint="optional, one per line">
          <textarea name="tasks" rows={4} value={form.tasks} onChange={set} className={input} />
        </Field>
        <Field label="Deliverables" hint="optional, one per line">
          <textarea name="deliverables" rows={3} value={form.deliverables} onChange={set} className={input} />
        </Field>
        <Field label="Validity (days)" hint="optional">
          <input name="validity_days" type="number" min="1" value={form.validity_days} onChange={set} className={input} />
        </Field>

        {errors.length > 0 && (
          <ul className="mt-5 list-disc rounded-md border border-red-300 bg-red-100 py-2 pl-7 pr-3 text-sm text-red-800">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
        {success && (
          <p className="mt-5 rounded-md border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-800">{success}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add project"}
        </button>
      </form>
    </section>
  );
}