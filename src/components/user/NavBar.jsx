import React, { useState } from "react";
import { NavLink } from "react-router";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import LogoImage from "../../assets/Logo.png";
import ProfileMenu from "./ProfileMenu";

const links = [
  { to: "/project-library", label: "Project Library" },
  { to: "/simulation", label: "My Simulations" },
];

const linkClass =
  "block rounded-md px-4 py-2 text-white transition-colors duration-200 hover:bg-white hover:text-black";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav-container relative m-6 flex flex-wrap items-center justify-between bg-[#17324D] p-3 ">
      <div className="nav-logo flex items-center gap-1">
        <img src={LogoImage} alt="logo" className="h-10 w-auto p-1" />
        <span className="p-2 font-bold text-white">PROJECT FINDER</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="mr-3 text-white md:hidden"
      >
        {open ? <IoMdClose size={26} /> : <IoMdMenu size={26} />}
      </button>

      <ul
        className={`nav-menu w-full flex-col gap-1 px-4 pb-4 pt-2
          ${open ? "flex" : "hidden"}
          md:ml-auto md:mr-5 md:flex md:w-auto md:flex-row md:gap-5 md:p-0`}
      >
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} className={linkClass} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <ProfileMenu onNavigate={() => setOpen(false)} />
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;