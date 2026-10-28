import { useCallback, useEffect, useState } from "react";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

const inputClass =
  "w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

// Reads a field whichever name the backend uses
const pick = (obj, ...keys) => {
  for (const k of keys) if (obj?.[k] != null && obj[k] !== "") return obj[k];
  return "";
};

function Block({ title, children }) {
  if (!children) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-[#17304d]">{title}</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

export default function StudentSimulation({ id, onBack }) {
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // submission state
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/simulations/${id}/`, { headers: authHeaders() });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim() && !link.trim() && !file) {
      setSubmitError("Add notes, a link or a file before submitting.");
      return;
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setSubmitError("The file is larger than 10MB.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      // ⚠️ Rename these keys if your backend expects different ones.
      const body = new FormData();
      if (notes.trim()) body.append("notes", notes.trim());
      if (link.trim()) body.append("link", link.trim());
      if (file) body.append("file", file);

      const res = await fetch(`${API_BASE}/simulations/${id}/submit/`, {
        method: "POST",
        headers: authHeaders(),
        body,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text ? text.slice(0, 200) : `Request failed (${res.status})`);
      }
      setSubmitted(true);
      setNotes("");
      setLink("");
      setFile(null);
    } catch (err) {
      setSubmitError(err.message || "Could not submit your work.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#edf3f1] p-5 text-[#17304d] sm:p-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-blue-600"
        >
          ← Back to projects
        </button>

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
                {[label(sim.industry), label(sim.difficulty ?? sim.level), label(sim.status)]
                  .filter(Boolean)
                  .map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {t}
                    </span>
                  ))}
              </div>
              {pick(sim, "company_name", "company") && (
                <p className="mt-3 text-sm text-slate-500">{pick(sim, "company_name", "company")}</p>
              )}
            </header>

            <Block title="Scenario">{pick(sim, "scenario_description", "scenario", "description")}</Block>
            <Block title="Business problem">{pick(sim, "business_problem")}</Block>
            <Block title="Objective">{pick(sim, "objective", "project_objective")}</Block>
            <Block title="Stakeholders / team">{label(pick(sim, "stakeholders", "team"))}</Block>
            <Block title="Your role">{label(pick(sim, "professional_role", "role"))}</Block>
            <Block title="Tasks">{pick(sim, "tasks")}</Block>
            <Block title="Required deliverables">{pick(sim, "deliverables", "required_deliverables")}</Block>

            {pick(sim, "brief", "brief_url", "project_brief") && (
              <a
                href={pick(sim, "brief", "brief_url", "project_brief")}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-600 underline"
              >
                Download project brief
              </a>
            )}

            {/* Submission */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-base font-medium">Submit your work</h2>

              {submitted && (
                <p role="status" className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
                  Your work has been submitted.
                </p>
              )}

              <div>
                <label htmlFor="notes" className="mb-2 block text-xs font-medium">Notes</label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarise your approach and findings"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="link" className="mb-2 block text-xs font-medium">Link (optional)</label>
                <input
                  id="link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium">File (optional)</label>
                <div className="relative flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-6 text-center transition-colors hover:bg-gray-50">
                  <input
                    type="file"
                    aria-label="Upload deliverable"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    accept=".pdf,.doc,.docx,.xlsx,.zip"
                  />
                  <span className="text-sm font-medium">{file?.name || "Upload a document"}</span>
                  <span className="mt-1 text-xs text-gray-400">PDF, DOCX, XLSX or ZIP: Max 10MB</span>
                </div>
              </div>

              {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full rounded-md border border-blue-500 bg-white px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 sm:w-auto"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-[#2563EB] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? "Submitting…" : "Submit work"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}