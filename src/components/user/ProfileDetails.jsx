import React, { useEffect, useState } from "react";
import { fetchProfile, formatDate } from "../../utils/profile";

const ProfileDetails = () => {
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

  if (loading) return <p className="text-sm text-slate-500">Loading profile…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!profile) return null;

  return (
    <div className="rounded-lg bg-white p-7">
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
  );
};

export default ProfileDetails;