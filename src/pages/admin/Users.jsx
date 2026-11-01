import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { MdSearch, MdFilterList, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useAdminData } from "../../context/AdminDataContext";

const PAGE_SIZE = 5;

const normalizeUser = (u, submissionsByUser) => {
  const rawDate = u.date_joined || u.created_at || u.registration_date || u.registered_at;
  
  
  let formattedDate = "-";
  if (rawDate) {
    const d = new Date(rawDate);
    if (!Number.isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      });
    } else {
      formattedDate = rawDate;
    }
  }

  return {
    id: u.id,
    name:
      u.full_name ||
      u.name ||
      [u.first_name, u.last_name].filter(Boolean).join(" ") ||
      u.username ||
      u.email ||
      "Unknown User",
    email: u.email || "",
    role: u.professional_role || u.profession || u.role || "—",
    date: formattedDate,
    started:
      u.simulations_started ??
      u.simulations_count ??
      u.started_count ??
      u.total_simulations ??
      0,
    submissions: 
      submissionsByUser[u.id] ?? 
      u.submissions_count ?? 
      u.total_submissions ?? 
      0,
  };
};

const Users = () => {
  const { users, submissionsByUser, loading, error } = useAdminData();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () => users.map((u) => normalizeUser(u, submissionsByUser)),
    [users, submissionsByUser]
  );

  const roles = useMemo(
    () => [...new Set(rows.map((u) => u.role).filter((r) => r && r !== "—"))],
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
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleRole = (e) => {
    setRole(e.target.value);
    setPage(1);
  };

  const th =
    "whitespace-nowrap border-b border-gray-200 px-2.5 py-3 text-left font-semibold text-gray-600";
  const td = "whitespace-nowrap border-b border-gray-200 px-2.5 py-3.5";
  const pageBtn =
    "cursor-pointer rounded-md px-2 py-1 text-sm text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400";

  return (
    <div>
      <h1 className="mb-1 text-3xl font-semibold text-[#17355f]">Users</h1>
      {!loading && (
        <p className="text-sm text-gray-500">
          {rows.length} registered {rows.length === 1 ? "user" : "users"}
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
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <MdOutlineKeyboardArrowDown size={18} />
        </label>
      </div>

      <div className="flex min-h-[420px] flex-col rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={th}>Full name</th>
                <th className={th}>Email</th>
                <th className={th}>Professional Role</th>
                <th className={th}>Registration Date</th>
                <th className={th}>Simulations Started</th>
                <th className={th}>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-2.5 py-8 text-center text-gray-500">
                    Loading users…
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2.5 py-8 text-center text-gray-500">
                    {rows.length === 0
                      ? "No users have registered yet."
                      : "No users match your search."}
                  </td>
                </tr>
              ) : (
                visible.map((u) => (
                  <tr key={u.id}>
                    <td className={`${td} font-semibold`}>
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="text-[#17355f] hover:text-blue-600 hover:underline"
                      >
                        {u.name || u.email}
                      </Link>
                    </td>
                    <td className={td}>{u.email}</td>
                    <td className={td}>{u.role || "—"}</td>
                    <td className={td}>{u.date}</td>
                    <td className={`${td} text-center font-medium text-slate-700`}>{u.started}</td>
                    <td className={`${td} text-center font-medium text-slate-700`}>{u.submissions}</td>
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`${pageBtn} ${n === current ? "!bg-blue-600 !text-white" : ""}`}
            >
              {n}
            </button>
          ))}
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