import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });


const SUBMISSIONS_URL = `${API_BASE}/simulations/?page_size=100`;
const userUrl = (id) => `${API_BASE}/users/${id}/`; // only used for the profile page
const USER_ROUTE = (id) => `/admin/users/${id}`;
const PAGE_SIZE = 10;

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
  if (typeof u !== "object") return String(u);
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ");
  return u.full_name ?? u.name ?? (full || u.username) ?? u.email ?? "";
};

const countOf = (v) => (Array.isArray(v) ? v.length : Number(v) || 0);


function toRow(s) {
  const who = s.user ?? s.student ?? s.owner;
  const project = s.project;
  return {
    id: s.id,
    userId: (typeof who === "object" ? who?.id : null) ?? s.user_id ?? s.student_id ?? (typeof who === "number" ? who : null),
    user: personName(who) || s.user_name || s.user_email || s.email || "Unknown user",
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
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e.message }));
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

function SubmissionsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr>
            {["User", "Project", "Industry", "Difficulty", "Status", "Uploads"].map((h) => (
              <th key={h} className="px-3 py-3.5 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#c9d1d6] text-sm text-slate-500">
              <td className={`px-3 py-4 font-semibold ${NAVY}`}>
                {r.userId != null ? (
                  <Link to={USER_ROUTE(r.userId)} className="hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
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
              <td className="px-3 py-4">{r.uploads}</td>
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
  const { data, loading, error } = useFetch(async () => listOf(await getJson(SUBMISSIONS_URL)).map(toRow), []);

  const statuses = useMemo(() => [...new Set((data ?? []).map((r) => r.status).filter(Boolean))], [data]);
  const filtered = useMemo(() => (data ?? []).filter((r) => !status || r.status === status), [data, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pagerBtn =
    "flex items-center gap-1 text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-[#7d8c99]";

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
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && <p className={MUTED}>Loading submissions…</p>}
      {error && <p className="text-red-700">Couldn't load submissions. {error}</p>}
      {data && data.length === 0 && <p className={MUTED}>No submissions yet.</p>}
      {data && data.length > 0 && filtered.length === 0 && <p className={MUTED}>No submissions match this filter.</p>}
      {rows.length > 0 && <SubmissionsTable rows={rows} />}

      {filtered.length > PAGE_SIZE && (
        <div className="mt-5 flex items-center justify-end gap-4">
          <button type="button" className={pagerBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <FiChevronLeft aria-hidden="true" /> Previous
          </button>
          <span>{page} / {pages}</span>
          <button type="button" className={pagerBtn} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next <FiChevronRight aria-hidden="true" />
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
        <li key={s.id} className="flex flex-wrap justify-between gap-4 rounded-lg bg-white px-4 py-3.5">
          <div>
            <span className={`font-semibold ${NAVY}`}>{s.project}</span>
            <span className={MUTED}>
              {[s.industry, s.difficulty].filter(Boolean).map((t) => ` · ${t}`).join("")}
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
    <div className="mt-6">
      <dt className="text-sm font-semibold">{text}</dt>
      <dd className={`mt-1 ${MUTED}`}>{children || "—"}</dd>
    </div>
  );
}

export function UserProfilePage() {
  const { userId } = useParams(); // route: /admin/users/:userId

  const { data, loading, error } = useFetch(async () => {
    const [profile, sims] = await Promise.all([
      getJson(userUrl(userId)).catch(() => null), // profile endpoint may not exist yet
      getJson(SUBMISSIONS_URL),
    ]);
    const raw = listOf(sims);
    const mine = raw.filter((s) => String((s.user && typeof s.user === "object" ? s.user.id : s.user) ?? s.user_id ?? s.student_id) === String(userId));
    // Fall back to the user details embedded in their simulations
    const embedded = mine.find((s) => s.user && typeof s.user === "object")?.user;
    return { profile: profile ?? embedded ?? null, simulations: mine.map(toRow) };
  }, [userId]);

  if (loading) return <Page title="User Profile"><p className={MUTED}>Loading profile…</p></Page>;
  if (error) return <Page title="User Profile"><p className="text-red-700">Couldn't load this profile. {error}</p></Page>;

  const { profile: u, simulations } = data;
  if (!u && !simulations.length) {
    return <Page title="User Profile"><p className={MUTED}>No details found for this user.</p></Page>;
  }

  const joined = u?.date_joined ?? u?.registered_at ?? u?.created_at;
  const registered = joined
    ? new Date(joined).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <Page title="User Profile">
      <dl className="max-w-2xl">
        <Field label="Full Name">{personName(u)}</Field>
        <Field label="Email">{u?.email}</Field>
        <Field label="Professional Role">{label(u?.professional_role ?? u?.role)}</Field>
        <Field label="Registration Date">{registered}</Field>
        <Field label="Simulation History">
          <SimulationHistory simulations={simulations} />
        </Field>
      </dl>
    </Page>
  );
}

export default SubmissionsPage;