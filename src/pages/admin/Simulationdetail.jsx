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

export default function SimulationDetail({ id, onBack }) {
  const [sim, setSim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

          </div>
        )}
      </div>
    </section>
  );
}