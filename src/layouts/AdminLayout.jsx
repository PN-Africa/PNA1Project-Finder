import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  MdOutlineDashboard,
  MdOutlinePeopleAlt,
  MdOutlineChatBubbleOutline,
  MdOutlineViewKanban,
  MdOutlinePersonOutline,
  MdLogout,
} from "react-icons/md";
import LogoImage from "../assets/logo.jpg";

const mainLinks = [
  { to: "/admin", label: "Dashboard", icon: <MdOutlineDashboard size={20} />, end: true },
  { to: "/admin/users", label: "Users", icon: <MdOutlinePeopleAlt size={20} /> },
  { to: "/admin/submissions", label: "Submissions", icon: <MdOutlineChatBubbleOutline size={20} /> },
  { to: "/admin/simulation-projects", label: "Simulation Projects", icon: <MdOutlineViewKanban size={20} /> },
];

const baseLink =
  "flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[0.95rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const linkClass = ({ isActive }) =>
  `${baseLink} ${isActive ? "bg-white text-[#12294d]" : "text-white hover:bg-white/10"}`;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#eef3f0] text-gray-800 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col bg-[#12294d] p-4 text-white md:sticky md:top-0 md:h-screen md:w-64 md:py-6">
        <div className="flex flex-col items-center gap-2 border-b border-white/25 pb-4">
          <img src={LogoImage} alt="Project Finder logo" className="h-11 w-11 rounded-md object-contain" />
          <span className="font-bold tracking-wide">PROJECT FINDER</span>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-2 md:mt-auto">
          <NavLink to="/admin/profile" className={linkClass}>
            <MdOutlinePersonOutline size={20} />
            <span>Profile</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className={`${baseLink} cursor-pointer text-white hover:bg-white/10`}
          >
            <MdLogout size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;