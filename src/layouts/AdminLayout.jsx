import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  MdOutlineDashboard,
  MdOutlinePeopleAlt,
  MdOutlineChatBubbleOutline,
  MdOutlineViewKanban,
  MdOutlinePersonOutline,
  MdLogout,
  MdOutlineKeyboardArrowUp,
  MdClose,
} from "react-icons/md";
import { LuPanelLeft, LuPanelLeftClose } from "react-icons/lu";
import { AdminDataProvider } from "../context/AdminDataContext";
import ConfirmModal from "../components/user/ConfirmModal";
import { logout } from "../utils/auth";
import LogoImage from "../assets/logo.jpg";

const mainLinks = [
  { to: "/admin", label: "Dashboard", icon: <MdOutlineDashboard size={20} />, end: true },
  { to: "/admin/users", label: "Users", icon: <MdOutlinePeopleAlt size={20} /> },
  { to: "/admin/submissions", label: "Submissions", icon: <MdOutlineChatBubbleOutline size={20} /> },
  { to: "/admin/simulation-projects", label: "Simulation Projects", icon: <MdOutlineViewKanban size={20} /> },
];

const baseLink =
  "flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[0.95rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const handleLoginAsUser = () => {
    setMenuOpen(false);
    navigate("/project-library");
  };

  const linkClass = ({ isActive }) =>
    `${baseLink} ${isActive ? "bg-white text-[#12294d]" : "text-white hover:bg-white/10"} ${
      isCollapsed ? "justify-center px-2" : ""
    }`;

  return (
    <div className="flex min-h-screen bg-[#eef3f0] text-gray-800">
      
      <div className="fixed top-0 left-0 z-40 flex w-full items-center justify-between bg-[#12294d] p-4 text-white md:hidden">
        <div className="flex items-center gap-2">
          <img src={LogoImage} alt="Logo" className="h-8 w-8 rounded object-contain" />
          <span className="font-bold">PROJECT FINDER</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="text-white">
          <LuPanelLeft size={28} />
        </button>
      </div>

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-[#12294d] p-4 text-white transition-all duration-300 ease-in-out
          md:static md:h-screen
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          w-64
        `}
      >
        <div className={`flex items-center border-b border-white/25 pb-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex flex-col items-center gap-2">
            <img src={LogoImage} alt="Project Finder logo" className="h-11 w-11 rounded-md object-contain" />
            {!isCollapsed && <span className="font-bold tracking-wide">PROJECT FINDER</span>}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex rounded-md p-1 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <LuPanelLeft size={22} /> : <LuPanelLeftClose size={22} />}
          </button>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="flex md:hidden text-white/70 hover:text-white"
          >
            <MdClose size={24} />
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClass}
              title={isCollapsed ? link.label : undefined}
              onClick={() => setIsMobileOpen(false)}
            >
              {link.icon}
              {!isCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <NavLink
            to="/admin/profile"
            className={linkClass}
            title={isCollapsed ? "Profile" : undefined}
            onClick={() => setIsMobileOpen(false)}
          >
            <MdOutlinePersonOutline size={20} />
            {!isCollapsed && <span>Profile</span>}
          </NavLink>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`${baseLink} cursor-pointer text-white hover:bg-white/10 justify-between ${
                isCollapsed ? "justify-center px-2" : ""
              }`}
              title={isCollapsed ? "Account" : undefined}
            >
              <div className="flex items-center gap-3">
                <MdOutlinePersonOutline size={20} />
                {!isCollapsed && <span>Account</span>}
              </div>
              {!isCollapsed && (
                <MdOutlineKeyboardArrowUp
                  size={20}
                  className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {menuOpen && (
              <div
                className={`absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-slate-700 bg-[#1a345c] py-1 shadow-xl ${
                  isCollapsed ? "ml-2" : "w-full"
                }`}
              >
                <button
                  onClick={handleLoginAsUser}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  <MdOutlinePersonOutline size={18} />
                  Log in as User
                </button>
                <div className="my-1 h-px w-full bg-white/10" />
                <button
                  onClick={() => {
                    setConfirmLogout(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-white/10 hover:text-red-200"
                >
                  <MdLogout size={18} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <main className="min-w-0 flex-1 px-4 py-6 pt-24 md:px-8 md:py-10 md:pt-10 transition-all duration-300">
        <AdminDataProvider>
          <Outlet />
        </AdminDataProvider>
      </main>

      <ConfirmModal
        open={confirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default AdminLayout;