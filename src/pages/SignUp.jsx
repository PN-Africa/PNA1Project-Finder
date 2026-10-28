import React, { useState } from "react";
import LogoImage from "../assets/logo.jpg";
import { useNavigate, NavLink } from "react-router";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[0.95rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 transition sm:text-base";
const inputError = "border-red-600 focus:border-red-600 focus:ring-red-600/15";

const SignUp = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);


  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    otherCategory: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    otherCategory: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      if (name === "email") {
        next.email =
          value === ""
            ? "Email is required"
            : !emailRegex.test(value)
            ? "Invalid email format"
            : "";
      }
      if (name === "fullName") {
        next.fullName = value.trim() === "" ? "Full name is required" : "";
      }
      if (name === "password") {
        next.password =
          value === ""
            ? "Password is required"
            : value.length < 8
            ? "Password must be at least 8 characters"
            : "";
        
        if (form.confirmPassword !== "") {
          next.confirmPassword =
            value !== form.confirmPassword ? "Passwords do not match" : "";
        }
      }
      if (name === "confirmPassword") {
        next.confirmPassword =
          value === ""
            ? "Please confirm your password"
            : value !== form.password
            ? "Passwords do not match"
            : "";
      }
      if (name === "role") next.role = value === "" ? "Select a role" : "";
      if (name === "otherCategory")
        next.otherCategory = value === "" ? "Enter your professional role" : "";
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess(false);

    const nextErrors = {
      fullName: form.fullName.trim() === "" ? "Full name is required" : "",
      email:
        form.email === ""
          ? "Email is required"
          : !emailRegex.test(form.email)
          ? "Invalid email format"
          : "",
      password:
        form.password === ""
          ? "Password is required"
          : form.password.length < 8
          ? "Password must be at least 8 characters"
          : "",
      confirmPassword:
        form.confirmPassword === ""
          ? "Please confirm your password"
          : form.confirmPassword !== form.password
          ? "Passwords do not match"
          : "",
      role: form.role === "" ? "Select a role" : "",
      otherCategory:
        form.role === "Others" && form.otherCategory === ""
          ? "Enter your professional role"
          : "",
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some((m) => m !== "")) return;

    // "Faith Odunayo Pelumi" -> first_name "Faith", last_name "Odunayo Pelumi"
    const [firstName, ...rest] = form.fullName.trim().split(/\s+/);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/registration/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email, // usernames can't contain spaces, so use the email
          first_name: firstName,
          last_name: rest.join(" "),
          email: form.email,
          password1: form.password,
          password2: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(
          data.username?.[0] ||
            data.first_name?.[0] ||
            data.last_name?.[0] ||
            data.email?.[0] ||
            data.password1?.[0] ||
            data.password?.[0] ||
            data.non_field_errors?.[0] ||
            data.detail ||
            "Registration failed. Please try again."
        );
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const errorText = (msg) =>
    msg ? <p className="-mt-2 mb-3 text-[0.8rem] text-red-600">{msg}</p> : null;

  return (
    <div className="mx-auto my-32 w-full max-w-[400px] rounded-xl bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,31,61,0.08)] max-[480px]:px-5 max-[480px]:py-6">
      <div className="flex items-center justify-center gap-2">
        <img src={LogoImage} alt="Logo" className="h-auto w-7" />
        <h1 className="text-[22px] font-semibold tracking-wide text-[#17324D] max-[480px]:text-lg">
          PROJECT FINDER
        </h1>
      </div>
      <h3 className="my-5 mb-6 text-[1.4rem] text-slate-500 max-[480px]:my-4 max-[480px]:mb-5 max-[480px]:text-xl">
        Let's get you started
      </h3>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col text-left">
        <label htmlFor="fullName" className="mb-1.5 text-sm font-medium text-slate-900">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={form.fullName}
          placeholder="Enter Full name"
          onChange={handleChange}
          autoComplete="name"
          className={`${inputBase} mb-3.5 ${errors.fullName ? inputError : ""}`}
        />
        {errorText(errors.fullName)}

        <label htmlFor="email" className="mb-1.5 text-sm font-medium text-slate-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          placeholder="you@example.com"
          onChange={handleChange}
          autoComplete="email"
          className={`${inputBase} mb-3.5 ${errors.email ? inputError : ""}`}
        />
        {errorText(errors.email)}

        <label htmlFor="role" className="mb-1.5 text-sm font-medium text-slate-900">
          Professional Role
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className={`${inputBase} mb-3.5 ${errors.role ? inputError : ""}`}
        >
          <option value="">Select Professional Role</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Project Coordinator">Project Coordinator</option>
          <option value="Project Support Officer">Project Support Officer</option>
          <option value="Project Delivery Support Officer">
            Project Delivery Support Officer
          </option>
          <option value="Project Officer">Project Officer</option>
          <option value="Business Analyst">Business Analyst</option>
          <option value="Others">Others</option>
        </select>
        {errorText(errors.role)}

        {form.role === "Others" && (
          <>
            <label
              htmlFor="otherCategory"
              className="mb-1.5 text-sm font-medium text-slate-900"
            >
              Please specify your role
            </label>
            <input
              id="otherCategory"
              type="text"
              name="otherCategory"
              value={form.otherCategory}
              onChange={handleChange}
              placeholder="Enter your professional role"
              className={`${inputBase} mb-3.5 ${errors.otherCategory ? inputError : ""}`}
            />
            {errorText(errors.otherCategory)}
          </>
        )}

        <label htmlFor="password" className="mb-1.5 text-sm font-medium text-slate-900">
          Password
        </label>
        <div className="relative mb-3.5">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            className={`${inputBase} pr-10 ${errors.password ? inputError : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center bg-transparent p-0 text-slate-500"
          >
            {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
          </button>
        </div>
        {errorText(errors.password)}

        <label
          htmlFor="confirmPassword"
          className="mb-1.5 text-sm font-medium text-slate-900"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          className={`${inputBase} mb-3.5 ${
            errors.confirmPassword ? inputError : ""
          }`}
        />
        {errorText(errors.confirmPassword)}

        {serverError && (
          <p className="mb-3 rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-800">
            {serverError}
          </p>
        )}
        {success && (
          <p className="mb-3 rounded-md border border-green-300 bg-green-100 px-3 py-2 text-sm text-green-800">
            Account created! Redirecting to login…
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 max-[480px]:min-h-[44px]"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="p-2 text-sm text-slate-600">
        Already have an account?{" "}
        <NavLink to="/login" className="font-medium text-blue-600 hover:underline">
          Sign In
        </NavLink>
      </p>
    </div>
  );
};

export default SignUp;