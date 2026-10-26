import React, { useState } from "react";
import { Link } from "react-router";
import { MdSearch, MdFilterList, MdOutlineKeyboardArrowDown } from "react-icons/md";

// Mock data for now. Later, replace with a fetch to the backend users endpoint.
const mockUsers = [
  { id: 1, name: "Sarah Wilson", email: "sarah@email.com", role: "Business Analyst", date: "23 September 2026", started: 3, submissions: 2 },
  { id: 2, name: "Merit Gold", email: "merit@email.com", role: "Product Manager", date: "20 September 2026", started: 2, submissions: 1 },
  { id: 3, name: "Sharon Mcwen", email: "sharon@email.com", role: "Project Manager", date: "18 September 2026", started: 4, submissions: 3 },
  { id: 4, name: "David Okafor", email: "david@email.com", role: "Project Coordinator", date: "15 September 2026", started: 1, submissions: 1 },
  { id: 5, name: "Amina Bello", email: "amina@email.com", role: "Project Officer", date: "12 September 2026", started: 5, submissions: 4 },
  { id: 6, name: "Tola Adeyemi", email: "tola@email.com", role: "Business Analyst", date: "10 September 2026", started: 2, submissions: 0 },
];

const PAGE_SIZE = 5;

const Users = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const roles = [...new Set(mockUsers.map((u) => u.role))];

  const filtered = mockUsers.filter((u) => {
    const text = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(text) || u.email.toLowerCase().includes(text);
    const matchesRole = role === "" || u.role === role;
    return matchesSearch && matchesRole;
  });

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

  const th = "whitespace-nowrap border-b border-gray-200 px-2.5 py-3 text-left font-semibold";
  const td = "whitespace-nowrap border-b border-gray-200 px-2.5 py-3.5";
  const pageBtn = "cursor-pointer rounded-md px-2 py-1 text-sm text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400";

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold text-[#17355f]">Users</h1>

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
              {visible.map((u) => (
                <tr key={u.id}>
                  <td className={`${td} font-semibold`}>
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="text-[#17355f] hover:text-blue-600 hover:underline"
                    >
                      {u.name}
                    </Link>
                  </td>
                  <td className={td}>{u.email}</td>
                  <td className={td}>{u.role}</td>
                  <td className={td}>{u.date}</td>
                  <td className={`${td} text-center`}>{u.started}</td>
                  <td className={`${td} text-center`}>{u.submissions}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2.5 py-8 text-center text-gray-500">
                    No users match your search. Try a different name or email.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4">
          <button type="button" className={pageBtn} disabled={current === 1} onClick={() => setPage(current - 1)}>
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
          <button type="button" className={pageBtn} disabled={current === totalPages} onClick={() => setPage(current + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Users;