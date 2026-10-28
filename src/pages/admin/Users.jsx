import React, { useMemo, useState } from "react";
// import { Link } from "react-router"; // re-enable with the detail route
import {
  MdSearch,
  MdFilterList,
  MdOutlineKeyboardArrowDown,
} from "react-icons/md";
import { useAdminData } from "../../context/AdminDataContext";

const PAGE_SIZE = 5;

const normalizeUser = (u, submissionsByUser) => ({
  id: u.id,
  name:
    u.full_name ||
    u.name ||
    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
    u.username ||
    "",
  email: u.email || "",
  role: u.professional_role || u.profession || u.role || "",
  date: u.date_joined || u.created_at || u.registration_date || "",
  started:
    u.simulations_started ??
    u.simulations_count ??
    u.started_count ??
    null,
  submissions: submissionsByUser[u.id] ?? u.submissions_count ?? 0,
});

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Users = () => {
  const { users, counts, submissionsByUser, loading, error } = useAdminData();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () => users.map((u) => normalizeUser(u, submissionsByUser)),
    [users, submissionsByUser]
  );

  const roles = useMemo(
    () => [...new Set(rows.map((u) => u.role).filter(Boolean))],
    [rows]
  );

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return rows.filter((u) => {
      const matchesSearch =
        text === "" ||
        u.name.toLowerCase().includes(text) ||
        u.email.toLowerCase().includes(text);
      const matchesRole = role === "" || u.role === role;
      return matchesSearch && matchesRole;
    });
  }, [rows, search, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleRole = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  const th =
    "whitespace-nowrap border-b border-gray-200 px-2.5 py-3 text-left font-semibold";
  const td =
    "whitespace-nowrap border-b border-gray-200 px-2.5 py-3.5";
  const pageBtn =
    "cursor-pointer rounded-md px-2 py-1 text-sm text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400";

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set([1, totalPages, current, current - 1, current + 1]);
    const arr = [...set]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
    const out = [];
    arr.forEach((n, i) => {
      if (i > 0 && n - arr[i - 1] > 1) out.push("…");
      out.push(n);
    });
    return out;
  }, [totalPages, current]);

  const displayCount = counts?.users ?? rows.length;

  return (
    <div>
      <h1 className="mb-1 text-3xl font-semibold text-[#17355f]">Users</h1>
      {!loading && (
        <p className="text-sm text-gray-500">
          {displayCount} registered {displayCount === 1 ? "user" : "users"}
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="my-6 flex flex-wrap gap-4">
        <label className="flex max-w-md flex-1 basis-72 items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-gray-500 focus-within:outline-2 focus-within:outline-blue-600">
          <MdSearch size={20} />
          <input
            type="text"
            placeholder="Search users by name or email"
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent text-sm text-gray-800 outline-none"
          />
        </label>

        <label className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-gray-500 focus-within:outline-2 focus-within:outline-blue-600">
          <MdFilterList size={20} />
          <select
            value={role}
            onChange={handleRole}
            aria-label="Filter by professional role"
            className="cursor-pointer appearance-none bg-transparent text-sm text-gray-800 outline-none"
          >
            <option value="">Filter by</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <MdOutlineKeyboardArrowDown size={18} />
        </label>
      </div>

      <div className="flex min-h-[420px] flex-col rounded-2xl bg-white px-5 py-4">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={th}>Full name</th>
                <th className={th}>Email</th>
                <th className={th}>Professional Role</th>
                <th className={th}>Registration Date</th>
                <th className={th}>Simulation Started</th>
                <th className={th}>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2.5 py-8 text-center text-gray-500"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2.5 py-8 text-center text-gray-500"
                  >
                    {rows.length === 0
                      ? "No users have registered yet."
                      : "No users match your search. Try a different name or email."}
                  </td>
                </tr>
              ) : (
                visible.map((u) => (
                  <tr key={u.id}>
                    <td className={`${td} font-semibold`}>
                      {/* Re-enable when /admin/users/:id route exists:
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="text-[#17355f] hover:text-blue-600 hover:underline"
                      >
                        {u.name || u.email}
                      </Link>
                      */}
                      <span className="text-[#17355f]">
                        {u.name || u.email}
                      </span>
                    </td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>{u.role || "-"}</td>
                    <td className={td}>{formatDate(u.date)}</td>
                    <td className={`${td} text-center`}>
                      {u.started ?? "-"}
                    </td>
                    <td className={`${td} text-center`}>{u.submissions}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <button
            type="button"
            className={pageBtn}
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </button>
          {pageNumbers.map((n, i) =>
            n === "…" ? (
              <span
                key={`gap-${i}`}
                className="px-1 text-sm text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`${pageBtn} ${
                  n === current ? "!bg-blue-600 !text-white" : ""
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            type="button"
            className={pageBtn}
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;