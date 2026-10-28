import React, { useEffect, useState } from "react";
import { MdOutlinePersonOutline, MdOutlineMailOutline, MdOutlineBadge, MdOutlineCalendarToday } from "react-icons/md";
import { apiFetch } from "../../utils/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/auth/user/");
        if (cancelled) return;
        setProfile(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
        });
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updated = await apiFetch("/auth/user/", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setProfile(updated);
      setEditing(false);
      setSuccess("Profile updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setForm({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold text-[#17355f]">Profile</h1>
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
          Loading profile…
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-semibold text-[#17355f]">Profile</h1>
        <div className="rounded-2xl bg-white p-8 text-center text-red-600">
          {error || "Could not load profile."}
        </div>
      </div>
    );
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || profile.email;
  const initials = fullName.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-semibold text-[#17355f]">Profile</h1>

      {success && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 md:p-8">
        {/* Avatar + name */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#12294d] text-2xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#17355f]">{fullName}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <hr className="mb-6 border-gray-200" />

        {!editing ? (
          <>
            <dl className="space-y-4">
              <div className="flex items-center gap-3">
                <MdOutlinePersonOutline size={20} className="text-gray-400" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Full name</dt>
                  <dd className="text-sm font-medium text-gray-900">{fullName}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdOutlineMailOutline size={20} className="text-gray-400" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Email</dt>
                  <dd className="text-sm font-medium text-gray-900">{profile.email}</dd>
                </div>
              </div>
              {profile.professional_role && (
                <div className="flex items-center gap-3">
                  <MdOutlineBadge size={20} className="text-gray-400" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Role</dt>
                    <dd className="text-sm font-medium text-gray-900">{profile.professional_role}</dd>
                  </div>
                </div>
              )}
              {profile.date_joined && (
                <div className="flex items-center gap-3">
                  <MdOutlineCalendarToday size={20} className="text-gray-400" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Joined</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {new Date(profile.date_joined).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-8 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto sm:px-6"
            >
              Edit profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-gray-900">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={form.first_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-[3px] focus:ring-blue-600/15"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-gray-900">
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={form.last_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-[3px] focus:ring-blue-600/15"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-900">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-[3px] focus:ring-blue-600/15"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;