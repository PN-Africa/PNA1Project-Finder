import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { FiUploadCloud, FiFileText, FiArrowLeft } from "react-icons/fi";
import ConfirmModal from "../components/user/ConfirmModal";
import FileMenu from "../components/user/FileMenu";
import { getSimulation, getProject, submitSimulation } from "../../src/utils/simulation";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = [".pdf", ".docx", ".xlsx"];

const getTimeLeft = (end) => {
  const diff = Math.max(0, end - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
  };
};

const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

const toProject = (p = {}) => ({
  ...p,
  title: p.title ?? p.name ?? "Untitled project",
  industry: label(p.industry),
  difficulty: label(p.difficulty ?? p.level),
  validity: p.validity,
  validityDays: p.validityDays ?? p.validity_days ?? 90,
  scenario: p.scenario,
  businessProblem: p.businessProblem ?? p.business_problem,
  objective: p.objective ?? p.objectives,
  stakeholders: p.stakeholders,
  context: p.context,
  role: p.role,
  tasks: p.tasks,
  deliverables: p.deliverables ?? p.required_deliverables,
});

const Section = ({ title, children }) => (
  <section className="mt-6">
    <h2 className="font-semibold text-[#17324D]">{title}</h2>
    <div className="mt-2 text-sm text-slate-600">{children}</div>
  </section>
);

const Simulation = () => {
  const { id } = useParams(); // the simulation's id

  const [project, setProject] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const inputRef = useRef(null);
  const replaceIndex = useRef(null); // null = adding, number = replacing that file

  
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const sim = await getSimulation(id);
        console.log("RAW simulation response:", sim); 

        let p = sim.project ?? sim.project_detail;
        if (p && typeof p !== "object") p = await getProject(p);
        if (!p && sim.project_id) p = await getProject(sim.project_id);

        if (cancelled) return;
        setProject(toProject(p));
        setSubmitted(String(sim.status ?? "").toLowerCase().includes("submit"));
        const start = Date.parse(sim.started_at ?? sim.created_at ?? sim.created ?? "");
        setStartedAt(Number.isNaN(start) ? null : start);
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

 
  useEffect(() => {
    if (!project || !startedAt) return;
    const end = startedAt + (project.validityDays || 90) * 86400000;
    const update = () => setTimeLeft(getTimeLeft(end));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [project, startedAt]);

  const openPicker = (index = null) => {
    replaceIndex.current = index;
    inputRef.current.click();
  };

  const handleFiles = (e) => {
    const valid = [];
    let err = "";
    Array.from(e.target.files).forEach((f) => {
      const ext = "." + f.name.split(".").pop().toLowerCase();
      if (!ALLOWED.includes(ext)) err = `${f.name}: only PDF, DOCX or XLSX files are allowed`;
      else if (f.size > MAX_SIZE) err = `${f.name} is larger than 10MB`;
      else valid.push(f);
    });
    setUploadError(err);

    if (valid.length > 0) {
      if (replaceIndex.current !== null) {
        const index = replaceIndex.current;
        setFiles((prev) => prev.map((f, i) => (i === index ? valid[0] : f)));
      } else {
        setFiles((prev) => [...prev, ...valid]);
      }
    }
    replaceIndex.current = null;
    e.target.value = ""; // lets you pick the same file again later
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmitClick = () => {
    if (files.length === 0) return;
    setSubmitError("");
    setConfirmSubmit(true);
  };

  const confirmSubmission = async () => {
    setConfirmSubmit(false);
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitSimulation(id, files);
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading simulation…</div>;
  }

  if (loadError || !project) {
    return (
      <div className="p-6">
        <p>{loadError ? `Couldn't load this simulation. ${loadError}` : "Simulation not found."}</p>
        <Link to="/project-library" className="text-blue-600">
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-[#17324D]">{project.title}</h1>
      <p className="mt-1 text-xs text-[#2563EB]">
        {project.industry} · {project.difficulty}
      </p>

      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
          submitted ? "bg-[#D9F5E3] text-[#15803D]" : "bg-blue-50 text-[#2563EB]"
        }`}
      >
        {submitted ? "Submitted" : "In progress"}
      </span>

      {project.validity && (
        <p className="mt-3 text-xs text-slate-500">Validity · {project.validity}</p>
      )}

      {timeLeft && !submitted && (
        <div className="mt-2 rounded-md bg-[#D9F5E3] px-3 py-2 text-xs text-[#15803D]">
          <p>Time Remaining</p>
          <p className="font-bold">
            {timeLeft.days} days {timeLeft.hours} hours Left
          </p>
        </div>
      )}

      {project.scenario && <Section title="Scenario">{project.scenario}</Section>}

      {project.businessProblem && (
        <Section title="Business Problem">
          <p className="italic">{project.businessProblem}</p>
        </Section>
      )}

      {project.objective && (
        <Section title="Objectives">
          <p className="italic">{project.objective}</p>
        </Section>
      )}

      {Array.isArray(project.stakeholders) && (
        <Section title="Stakeholders / Team">
          <ul className="list-disc pl-5">
            {project.stakeholders.map((s, i) => (
              <li key={i}>{label(s)}</li>
            ))}
          </ul>
        </Section>
      )}

      {project.context && <Section title="Context">{project.context}</Section>}

      {project.role && <Section title="Role">{label(project.role)}</Section>}

      {Array.isArray(project.tasks) && (
        <Section title="Tasks">
          <ol className="list-decimal pl-5">
            {project.tasks.map((t, i) => (
              <li key={i}>{label(t) || String(t)}</li>
            ))}
          </ol>
        </Section>
      )}

      {Array.isArray(project.deliverables) && (
        <Section title="Required Deliverables">
          <ul className="list-disc pl-5">
            {project.deliverables.map((d, i) => (
              <li key={i}>{label(d) || String(d)}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* documents */}
      <Section title="Documents">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.xlsx"
          multiple
          onChange={handleFiles}
          className="hidden"
        />

        {!submitted && (
          <button
            type="button"
            onClick={() => openPicker(null)}
            className="flex w-full flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-6 text-center hover:bg-slate-50"
          >
            <FiUploadCloud size={22} className="text-slate-500" />
            <span className="text-sm text-slate-700">Upload a document</span>
            <span className="text-xs text-slate-400">PDF, DOCX or XLSX · Max 10MB</span>
          </button>
        )}

        {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}

        {files.length === 0 && submitted && (
          <p className="text-xs text-slate-400">No documents.</p>
        )}

        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={f.name + i}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FiFileText className="shrink-0 text-slate-500" />
                <span className="truncate text-xs">{f.name}</span>
              </span>
              <FileMenu
                file={f}
                submitted={submitted}
                onReplace={() => openPicker(i)}
                onDelete={() => removeFile(i)}
              />
            </li>
          ))}
        </ul>
      </Section>

      //submit
      <Section title="Submit Simulation">
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={files.length === 0 || submitted || submitting}
          className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitted ? "Submitted" : submitting ? "Submitting…" : "Submit Simulation"}
        </button>

        {files.length === 0 && !submitted && (
          <p className="mt-2 text-xs text-slate-400">Upload at least one document to submit.</p>
        )}
        {submitError && <p className="mt-2 text-xs text-red-600">{submitError}</p>}
        {submitted && (
          <p className="mt-2 text-xs text-[#15803D]">
            Your simulation has been submitted.
          </p>
        )}
      </Section>

      <Link
        to="/project-library"
        className="mt-8 inline-flex items-center gap-2 text-xs text-[#2563EB] hover:underline"
      >
        <FiArrowLeft /> Back to Project Library
      </Link>

      <ConfirmModal
        open={confirmSubmit}
        title="Submit Simulation"
        message="Are you sure you want to submit this simulation?"
        confirmLabel="Submit"
        onConfirm={confirmSubmission}
        onCancel={() => setConfirmSubmit(false)}
      />
    </div>
  );
};

export default Simulation;