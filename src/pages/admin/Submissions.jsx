import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { FiChevronLeft, FiChevronRight, FiFileText } from "react-icons/fi";
import { useAdminData } from "../../context/AdminDataContext";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const SUBMISSIONS_URL = `${API_BASE}/admin/simulations/?page_size=100`;
const userUrl = (id) => `${API_BASE}/admin/users/${id}/`;
const USER_ROUTE = (id) => `/admin/users/${id}`;
const PAGE_SIZE = 6;

const NAVY = "text-[#17304d]";
const MUTED = "text-[#7d8c99]";

async function getJson(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

const listOf = (data) => (Array.isArray(data) ? data : data?.results ?? []);

const label = (v) =>
  v == null ? "" : typeof v === "object" ? v.name ?? v.title ?? v.label ?? "" : String(v);

const personName = (u) => {
  if (!u) return "";
  if (typeof u === "string") return u;
  if (typeof u !== "object") return String(u);
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return u.full_name ?? u.name ?? (full || u.username) ?? u.email ?? "";
};

const countOf = (v) => (Array.isArray(v) ? v.length : Number(v) || 0);

const idOf = (u) => (u && typeof u === "object" ? u.id ?? u.pk ?? u.user_id ?? null : null);

const ownerIdOf = (s) => {
  const who = s.user ?? s.student ?? s.owner;
  if (who && typeof who === "object") return idOf(who);
  return who ?? s.user_id ?? s.student_id ?? null;
};

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

function toRow(s) {
  const project = s.project;
  return {
    id: s.id,
    userId: ownerIdOf(s),
    user:
      personName(s.user ?? s.student ?? s.owner) ||
      s.user_name ||
      s.user_email ||
      s.email ||
      "Unknown user",
    project: s.project_title ?? label(project) ?? s.title ?? "—",
    industry: label(s.industry ?? project?.industry),
    difficulty: label(s.difficulty_level ?? s.difficulty ?? project?.difficulty_level),
    status: label(s.status) || (s.is_submitted ? "Submitted" : "In Progress"),
    uploads: countOf(s.uploads_count ?? s.submissions_count ?? s.files ?? s.uploads ?? s.submissions),
  };
}

function useFetch(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null }); 

    fn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ data: null, loading: false, error: e.message });
      });

    return () => {
      cancelled = true;
    };

  }, deps);

  return state;
}

const Page = ({ title, children }) => (
  <section className={`min-h-full bg-[#edf3f1] p-5 sm:p-8 ${NAVY}`}>
    <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
    {children}
  </section>
);

function SubmissionFiles({ simulationId, onClose }) {
  const { data, loading, error } = useFetch(async () => {
    const res = await fetch(`${API_BASE}/admin/simulations/${simulationId}/uploads/`, {
      headers: authHeaders(),
    });
    return res.ok ? listOf(await res.json()) : [];
  }, [simulationId]);

  const handleDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed", err);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-blue-900">Submitted Files</h4>
        <button onClick={onClose} className="text-xs text-blue-600 hover:underline">
          Close
        </button>
      </div>

      {loading && <p className="text-sm text-blue-600">Loading files…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && data && data.length === 0 && (
        <p className="text-sm text-blue-600">No files uploaded.</p>
      )}

      {!loading && data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((f, i) => {
            const filename = f.filename || f.name || f.file?.split("/").pop() || "Document";
            const size = f.size_kb ? `(${f.size_kb} KB)` : "";
            const url = f.file || f.url;

            return (
              <li
                key={f.id || i}
                className="flex items-center justify-between rounded bg-white p-3 text-sm shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <FiFileText className="shrink-0 text-blue-500" />
                  <span className="truncate font-medium text-slate-700">{filename}</span>
                  {size && <span className="text-xs text-slate-400">{size}</span>}
                </div>

                {url && (
                  <button
                    type="button"
                    onClick={() => handleDownload(url, filename)}
                    className="ml-4 shrink-0 text-xs font-semibold text-[#15803D] hover:underline"
                  >
                    Download
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SubmissionsTable({ rows }) {
  const [expandedRow, setExpandedRow] = useState(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr>
            {["User", "Project", "Industry", "Difficulty", "Status", "Uploads"].map((h) => (
              <th key={h} className="px-3 py-3.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#c9d1d6] text-sm text-slate-500">
              <td className={`px-3 py-4 font-semibold ${NAVY}`}>
                {r.userId != null ? (
                  <Link
                    to={USER_ROUTE(r.userId)}
                    className="hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    {r.user}
                  </Link>
                ) : (
                  r.user
                )}
              </td>
              <td className="px-3 py-4">{r.project}</td>
              <td className="px-3 py-4">{r.industry || "—"}</td>
              <td className="px-3 py-4">{r.difficulty || "—"}</td>
              <td className="px-3 py-4">{r.status}</td>
              <td className="px-3 py-4">
                <button
                  type="button"
                  onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}
                  className="rounded bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                >
                  {expandedRow === r.id ? "Hide" : "View"}
                </button>
                {expandedRow === r.id && (
                  <SubmissionFiles simulationId={r.id} onClose={() => setExpandedRow(null)} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubmissionsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, loading, error } = useFetch(
    async () => listOf(await getJson(SUBMISSIONS_URL)).map(toRow),
    []
  );

  const statuses = useMemo(
    () => [...new Set((data ?? []).map((r) => r.status).filter(Boolean))],
    [data]
  );
  const filtered = useMemo(
    () => (data ?? []).filter((r) => !status || r.status === status),
    [data, status]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const pageBtn =
    "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed";

  return (
    <Page title="Submissions">
      <div className="mb-5 flex justify-between">
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="cursor-pointer rounded-lg bg-white px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <option value="">Filter by: All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className={MUTED}>Loading submissions…</p>}
      {error && <p className="text-red-700">Couldn't load submissions. {error}</p>}
      {data && data.length === 0 && <p className={MUTED}>No submissions yet.</p>}
      {data && data.length > 0 && filtered.length === 0 && (
        <p className={MUTED}>No submissions match this filter.</p>
      )}
      
      {rows.length > 0 && <SubmissionsTable rows={rows} />}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            className={`${pageBtn} text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent`}
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <FiChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`${pageBtn} ${
                n === current 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            className={`${pageBtn} text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent`}
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </Page>
  );
}

function SimulationHistory({ simulations }) {
  if (!simulations.length) return <p className={MUTED}>No simulations started yet</p>;

  return (
    <ul className="grid gap-3">
      {simulations.map((s) => (
        <li
          key={s.id}
          className="flex flex-wrap justify-between gap-4 rounded-lg bg-white px-4 py-3.5 shadow-sm"
        >
          <div>
            <span className={`font-semibold ${NAVY}`}>{s.project}</span>
            <span className={MUTED}>
              {[s.industry, s.difficulty]
                .filter(Boolean)
                .map((t) => ` · ${t}`)
                .join("")}
            </span>
          </div>
          <div className={`flex gap-4 text-sm ${MUTED}`}>
            <span>{s.status}</span>
            <span>{s.uploads} uploads</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Field({ label: text, children }) {
  return (
    <div className="mt-6 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <dt className="text-sm font-semibold text-slate-600">{text}</dt>
      <dd className={`mt-1 text-base ${NAVY}`}>{children || "—"}</dd>
    </div>
  );
}

export function UserProfilePage() {
  const { userId } = useParams(); 
  const { users } = useAdminData();

  const { data, loading, error } = useFetch(async () => {
    if (!userId) return { fetched: null, sims: [] };

    const [fetched, sims] = await Promise.all([
      getJson(userUrl(userId)).catch(() => null),
      getJson(SUBMISSIONS_URL).catch(() => ({ results: [] })),
    ]);

    return {
      fetched: sameId(idOf(fetched), userId) ? fetched : null,
      sims: listOf(sims),
    };
  }, [userId]);

  const simulations = useMemo(
    () => (data?.sims ?? []).filter((s) => sameId(ownerIdOf(s), userId)).map(toRow),
    [data, userId]
  );

  const profile = useMemo(() => {
    if (!data) return null;

    const fromContext = (users ?? []).find((u) => sameId(idOf(u), userId));

    const embedded = (data.sims ?? [])
      .filter((s) => sameId(ownerIdOf(s), userId))
      .map((s) => s.user ?? s.student ?? s.owner)
      .find((u) => u && typeof u === "object");

    return data.fetched ?? fromContext ?? embedded ?? null;
  }, [data, users, userId]);

  if (loading) {
    return (
      <Page title="User Profile">
        <p className={MUTED}>Loading profile…</p>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="User Profile">
        <p className="text-red-700">Couldn't load this profile. {error}</p>
      </Page>
    );
  }

  if (!profile && simulations.length === 0) {
    return (
      <Page title="User Profile">
        <p className={MUTED}>No details found for this user.</p>
        <Link to="/admin/users" className="mt-4 inline-block text-blue-600 hover:underline">
          &larr; Back to Users
        </Link>
      </Page>
    );
  }

  const joined = profile?.date_joined ?? profile?.registered_at ?? profile?.created_at;
  const registered = joined
    ? new Date(joined).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <Page title="User Profile">
      <div className="mb-6">
        <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Users list
        </Link>
      </div>

      <div className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
        <Field label="Full Name">{personName(profile)}</Field>
        <Field label="Email">{profile?.email}</Field>
        <Field label="Professional Role">
          {label(profile?.professional_role ?? profile?.role)}
        </Field>
        <Field label="Registration Date">{registered}</Field>
        <Field label="Simulation History">
          <SimulationHistory simulations={simulations} />
        </Field>
      </div>
    </Page>
  );
}

export default SubmissionsPage;