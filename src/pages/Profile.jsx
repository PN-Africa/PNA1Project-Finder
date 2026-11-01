import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchProfile, formatDate } from "../utils/profile";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-[#17324D]">My Profile</h1>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading profile…</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {profile && (
        <>
          <p className="mt-4 rounded-md bg-[#D9F5E3] px-4 py-2 text-sm text-[#15803D]">
            Profile loaded successfully
          </p>

          <div className="mt-6 space-y-4 rounded-lg bg-white p-6">
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

          <Link
            to="/edit-profile"
            className="mt-6 inline-block rounded-md bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Edit Profile
          </Link>
        </>
      )}
    </div>
  );
};

export default Profile;