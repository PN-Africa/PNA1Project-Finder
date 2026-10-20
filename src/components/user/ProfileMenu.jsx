import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import ConfirmModal from "./ConfirmModal";

const ProfileMenu = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeAll = () => {
    setOpen(false);
    if (onNavigate) onNavigate(); // closes the mobile menu too
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("currentUser");
    } catch {
      /* ignore */
    }
    setConfirmLogout(false);
    closeAll();
    navigate("/login", { replace: true });
  };

  const itemClass = "block w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="block rounded-md px-4 py-2 text-white transition-colors duration-200 hover:bg-white hover:text-black"
      >
        Profile
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          <Link to="/profile" role="menuitem" className={itemClass} onClick={closeAll}>
            View Profile
          </Link>
          <Link to="/edit-profile" role="menuitem" className={itemClass} onClick={closeAll}>
            Edit Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              setConfirmLogout(true);
            }}
          >
            Log Out
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmLogout}
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
};

export default ProfileMenu;