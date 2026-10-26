import React from "react";
import { MdOutlineViewKanban, MdOutlineChatBubbleOutline } from "react-icons/md";

// Mock data for now. Later, replace with a fetch to the backend.
const stats = {
  totalProjects: 120,
  submitted: 43,
  inProgress: 17,
};

const StatCard = ({ icon, label, value, iconColor }) => (
  <div className="rounded-2xl bg-white p-5">
    <span className={`inline-flex ${iconColor}`}>{icon}</span>
    <p className="mb-1 mt-2 text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-[#17355f]">{value}</p>
  </div>
);

const ActivityRow = ({ label, value, max, barColor }) => (
  <div className="mb-3.5 grid grid-cols-[minmax(80px,40%)_1fr_auto] items-center gap-3">
    <div className="h-3.5">
      <div
        className={`h-full rounded-full ${barColor}`}
        style={{ width: `${Math.round((value / max) * 100)}%` }}
      />
    </div>
    <span>{label}</span>
    <span className="text-gray-500">{value}</span>
  </div>
);

const Dashboard = () => {
  const max = Math.max(stats.inProgress, stats.submitted);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold text-[#17355f]">Hi, Admin</h1>
      <p className="mb-8 text-sm text-gray-500">
        Manage users, submissions and simulation projects from one place.
      </p>

      <section className="rounded-[20px] bg-[#e8f0fd] p-5 md:p-7">
        <h2 className="mb-5 text-lg font-medium text-[#17355f]">Overview of Project Finder</h2>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard
            icon={<MdOutlineViewKanban size={20} />}
            iconColor="text-blue-600"
            label="Total Projects"
            value={stats.totalProjects}
          />
          <StatCard
            icon={<MdOutlineChatBubbleOutline size={20} />}
            iconColor="text-green-600"
            label="Submitted"
            value={stats.submitted}
          />
        </div>

        <div className="rounded-2xl bg-white px-6 py-5">
          <h3 className="mb-4 text-base font-medium text-[#17355f]">Simulation Activity</h3>
          <ActivityRow label="In progress" value={stats.inProgress} max={max} barColor="bg-blue-600" />
          <ActivityRow label="Submitted" value={stats.submitted} max={max} barColor="bg-green-600" />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;