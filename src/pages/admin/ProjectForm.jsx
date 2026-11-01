import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { createProject, getAdminProject, updateProject } from "../../utils/projects";

const emptyForm = {
  title: "",
  scenario_name: "",
  scenario_description: "",
  business_problem: "",
  objective: "",
  professional_role: "",
  duration_in_days: 30,
  industry: "technology",
  difficulty_level: "beginner",
  stakeholders: "", // text, one per line
  tasks: "",        // text, one per line
  is_published: false,
};

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-[3px] focus:ring-blue-600/15";

const ProjectForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [deliverables, setDeliverables] = useState([]); // Array of {name, description}
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminProject(id);
        if (cancelled) return;

        setForm({
          title: data.title || "",
          scenario_name: data.scenario_name || "",
          scenario_description: data.scenario_description || "",
          business_problem: data.business_problem || "",
          objective: data.objective || "",
          professional_role: data.professional_role || "",
          duration_in_days: data.duration_in_days || 30,
          industry: data.industry || "technology",
          difficulty_level: data.difficulty_level || "beginner",
          stakeholders: Array.isArray(data.stakeholders) ? data.stakeholders.join("\n") : "",
          tasks: Array.isArray(data.tasks) ? data.tasks.join("\n") : "",
          is_published: Boolean(data.is_published),
        });

        setDeliverables(
          Array.isArray(data.deliverables)
            ? data.deliverables.map((d) => ({
                name: typeof d === "object" ? d.name || "" : String(d),
                description: typeof d === "object" ? d.description || "" : "",
              }))
            : []
        );
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  
  const addDeliverable = () => {
    setDeliverables((prev) => [...prev, { name: "", description: "" }]);
  };

  const updateDeliverable = (index, field, value) => {
    setDeliverables((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const removeDeliverable = (index) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        duration_in_days: Number(form.duration_in_days) || 30,
        stakeholders: form.stakeholders.split("\n").map((s) => s.trim()).filter(Boolean),
        tasks: form.tasks.split("\n").map((s) => s.trim()).filter(Boolean),
        deliverables: deliverables.filter((d) => d.name.trim() !== ""), 
      };

      if (isEdit) await updateProject(id, payload);
      else await createProject(payload);

      navigate("/admin/simulation-projects");
    } catch (e) {
      setError(e.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading project…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#17355f]">
          {isEdit ? "Edit Project" : "Create Project"}
        </h1>
        <Link
          to="/admin/simulation-projects"
          className="text-sm text-slate-500 hover:underline"
        >
          ← Back to list
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Basic Info</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className={input} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">Industry</label>
              <select name="industry" value={form.industry} onChange={handleChange} className={input}>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">Difficulty</label>
              <select name="difficulty_level" value={form.difficulty_level} onChange={handleChange} className={input}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">Duration (days)</label>
              <input type="number" name="duration_in_days" value={form.duration_in_days} onChange={handleChange} min={1} className={input} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Professional Role</label>
            <input name="professional_role" value={form.professional_role} onChange={handleChange} className={input} placeholder="e.g. Project Manager" />
          </div>
        </div>

    
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Scenario Details</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Scenario Name</label>
            <input name="scenario_name" value={form.scenario_name} onChange={handleChange} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Scenario Description</label>
            <textarea name="scenario_description" value={form.scenario_description} onChange={handleChange} rows={3} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Business Problem</label>
            <textarea name="business_problem" value={form.business_problem} onChange={handleChange} rows={2} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Objective</label>
            <textarea name="objective" value={form.objective} onChange={handleChange} rows={2} className={input} />
          </div>
        </div>

        
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Requirements</h2>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Stakeholders (one per line)</label>
            <textarea name="stakeholders" value={form.stakeholders} onChange={handleChange} rows={3} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-900">Tasks (one per line)</label>
            <textarea name="tasks" value={form.tasks} onChange={handleChange} rows={3} className={input} />
          </div>
        </div>

      
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Deliverables</h2>
            <button type="button" onClick={addDeliverable} className="text-xs font-semibold text-blue-600 hover:underline">
              + Add Deliverable
            </button>
          </div>
          {deliverables.map((d, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex-1 space-y-2">
                <input
                  placeholder="Deliverable Name"
                  value={d.name}
                  onChange={(e) => updateDeliverable(i, "name", e.target.value)}
                  className={input}
                />
                <input
                  placeholder="Description"
                  value={d.description}
                  onChange={(e) => updateDeliverable(i, "description", e.target.value)}
                  className={input}
                />
              </div>
              <button type="button" onClick={() => removeDeliverable(i)} className="mt-1 text-xs text-red-500 hover:underline">
                Remove
              </button>
            </div>
          ))}
          {deliverables.length === 0 && (
            <p className="text-xs text-slate-400">No deliverables added yet.</p>
          )}
        </div>

  
        <div className="border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
            <span className="text-sm font-medium text-slate-900">Publish immediately</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create project"}
          </button>
          <button type="button" onClick={() => navigate("/admin/simulation-projects")} className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;