import React, { useState } from "react";
import { useNavigate } from "react-router";
import { getProfile, saveProfile, formatDate, roles } from "../utils/profile";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#1E293B] focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-[#2563EB] focus:ring-blue-100"
  }`;

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => getProfile());
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const found = {};
    if (!form.fullName.trim()) found.fullName = "Enter your full name";
    if (!form.email.trim()) found.email = "Email is required";
    else if (!emailRegex.test(form.email)) found.email = "Invalid email format";
    if (!form.role) found.role = "Select a professional role";
    return found;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    saveProfile({ ...form, fullName: form.fullName.trim(), email: form.email.trim() });
    navigate("/edited-profile");
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-[#17324D]">My Profile</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-md">
        <label htmlFor="fullName" className="text-sm font-semibold text-[#17324D]">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter name"
          className={`mt-1 ${inputClass(errors.fullName)}`}
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}

        <label htmlFor="email" className="mt-5 block text-sm font-semibold text-[#17324D]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          className={`mt-1 ${inputClass(errors.email)}`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}

        <label htmlFor="role" className="mt-5 block text-sm font-semibold text-[#17324D]">
          Professional Role
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className={`mt-1 ${inputClass(errors.role)}`}
        >
          <option value="">Select professional role</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}

        <p className="mt-5 text-sm font-semibold text-[#17324D]">Registration Date</p>
        <p className="mt-1 text-sm text-slate-500">{formatDate(form.registrationDate)}</p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="rounded-md border border-[#2563EB] bg-white px-5 py-2 text-sm font-semibold text-[#2563EB] hover:bg-blue-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;