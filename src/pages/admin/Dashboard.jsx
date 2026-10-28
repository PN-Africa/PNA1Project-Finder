import { useAdminData } from "../../context/AdminDataContext";

const Dashboard = () => {
  const { counts, loading, error } = useAdminData();

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading…</p>;

  const cards = [
    { label: "Registered Users", value: counts.users },
    { label: "Submissions", value: counts.submissions },
    { label: "Simulation Projects", value: counts.projects },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-[#17324D]">Dashboard</h1>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-bold text-[#17324D]">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Dashboard;