import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { fetchProfile, formatDate } from "../utils/profile";
import DeleteAccountModal from "../components/user/DeleteAccountModal";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";


const DELETE_URL = `${API_BASE}/auth/user/delete`;
const DELETE_METHOD = "POST";


const deleteErrorMessage = (status, data) => {
  const fromServer =
    data?.detail ||
    data?.password?.[0] ||
    data?.current_password?.[0] ||
    data?.old_password?.[0] ||
    data?.non_field_errors?.[0] ||
    "";

  if (status === 401 || status === 403) {
    return fromServer || "Your session has expired. Please log in again and retry.";
  }
  if (status === 404 || status === 405) {
    return `Account deletion isn't available right now (server error ${status}).`;
  }
  if (status >= 500) {
    return "The server had a problem. Please try again later.";
  }
  return fromServer || `Deletion failed (error ${status}). Please try again.`;
};

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (password) => {
    setDeleteError("");

    
    if (typeof password !== "string" || password === "") {
      setDeleteError("Please enter your password.");
      return;
    }

    setDeleteLoading(true);

    try {
      const res = await fetch(DELETE_URL, {
        method: DELETE_METHOD,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Delete account failed:", res.status, data);
        throw new Error(deleteErrorMessage(res.status, data));
      }

      
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      setDeleteError(err.message || "Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-[#17324D]">My Profile</h1>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading profile…</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {profile && (
        <>
          <div className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Full Name</p>
              <p className="mt-1 text-base font-medium text-[#17324D]">{profile.fullName || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-1 text-base font-medium text-[#17324D]">{profile.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Professional Role</p>
              <p className="mt-1 text-base font-medium text-[#17324D]">{profile.role || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Registration Date</p>
              <p className="mt-1 text-base font-medium text-[#17324D]">
                {formatDate(profile.registrationDate)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link
              to="/edit-profile"
              className="w-full rounded-md bg-[#2563EB] px-5 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              Edit Profile
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full rounded-md border border-red-200 bg-red-50 px-5 py-2 text-center text-sm font-medium text-red-600 hover:bg-red-100 sm:w-auto"
            >
              Delete Account
            </button>
          </div>
        </>
      )}

      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
};

export default Profile;