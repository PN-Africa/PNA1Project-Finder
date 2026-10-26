import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getSubmissions, getUserProfile } from "./api";

/* Colours from the design, kept in one place.
   Optional: move these into your Tailwind theme (navy, surface, muted). */
const NAVY = "text-[#17304d]";
const MUTED = "text-[#7d8c99]";

/* Small hook so every page handles loading + error the same way */
function useFetch(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e.message }));
    return () => (cancelled = true);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

const Page = ({ title, children }) => (
  <section className={`min-h-full bg-[#edf3f1] p-5 sm:p-8 ${NAVY}`}>
    <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
    {children}
  </section>
);

/* ---------- Shared table ---------- */
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
              <td className={`px-3 py-4 font-semibold ${NAVY}`}>{r.user}</td>
              <td className="px-3 py-4">{r.project}</td>
              <td className="px-3 py-4">{r.industry}</td>
              <td className="px-3 py-4">{r.difficulty}</td>
              <td className="px-3 py-4">{r.status}</td>
              <td className="px-3 py-4">{r.uploads}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Admin: Submissions page ---------- */
export function SubmissionsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error } = useFetch(() => getSubmissions({ page, status }), [page, status]);

  const pagerBtn =
    "text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:text-[#7d8c99]";

  return (
    <Page title="Submissions">
      <div className="mb-5 flex justify-between">
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="cursor-pointer rounded-lg bg-white px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <option value="">Filter by: All</option>
          <option value="In Progress">In Progress</option>
          <option value="Submitted">Submitted</option>
        </select>
      </div>

      {loading && <p className={MUTED}>Loading submissions…</p>}
      {error && <p className="text-red-700">Couldn't load submissions. {error}</p>}
      {data && data.results.length === 0 && (
        <p className={MUTED}>No submissions match this filter.</p>
      )}
      {data && data.results.length > 0 && <SubmissionsTable rows={data.results} />}

      <div className="mt-5 flex items-center justify-end gap-4">
        <button className={pagerBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          ‹ Previous
        </button>
        <span>{page}</span>
        <button
          className={pagerBtn}
          disabled={!data || data.results.length === 0}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ›
        </button>
      </div>
    </Page>
  );
}

/* ---------- Admin: User profile ---------- */
function SimulationHistory({ simulations }) {
  // Empty state: user has not started any simulation
  if (!simulations.length) {
    return <p className={MUTED}>No simulations started yet</p>;
  }
  // Populated state: user has simulations
  return (
    <ul className="grid gap-3">
      {simulations.map((s) => (
        <li
          key={s.id}
          className="flex flex-wrap justify-between gap-4 rounded-lg bg-white px-4 py-3.5"
        >
          <div>
            <span className={`font-semibold ${NAVY}`}>{s.project}</span>
            <span className={MUTED}> · {s.industry} · {s.difficulty}</span>
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

function Field({ label, children }) {
  return (
    <div className="mt-6">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className={`mt-1 ${MUTED}`}>{children}</dd>
    </div>
  );
}

export function UserProfilePage() {
  const { userId } = useParams(); // route: /admin/users/:userId
  const { data: u, loading, error } = useFetch(() => getUserProfile(userId), [userId]);

  if (loading) return <Page title="User Profile"><p className={MUTED}>Loading profile…</p></Page>;
  if (error) return <Page title="User Profile"><p className="text-red-700">Couldn't load this profile. {error}</p></Page>;

  const registered = new Date(u.registeredAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <Page title="User Profile">
      <dl className="max-w-2xl">
        <Field label="Full Name">{u.fullName}</Field>
        <Field label="Email">{u.email}</Field>
        <Field label="Professional Role">{u.role}</Field>
        <Field label="Registration Date">{registered}</Field>
        <Field label="Simulation History">
          <SimulationHistory simulations={u.simulations} />
        </Field>
      </dl>
    </Page>
  );
}
export default SubmissionsPage;