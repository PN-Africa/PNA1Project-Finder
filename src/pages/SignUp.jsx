import React, { useState } from "react";
import LogoImage from "../assets/logo.jpg";
import { NavLink } from "react-router";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[0.95rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 transition sm:text-base";
const inputError = "border-red-600 focus:border-red-600 focus:ring-red-600/15";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  otherCategory: "",
};

const EMPTY_ERRORS = { ...EMPTY_FORM };


const validators = {
  fullName: (v) => {
    const name = v.trim();
    if (!name) return "Full name is required";
    if (name.split(/\s+/).length < 2) return "Enter your first and last name";
    return "";
  },
  email: (v) => {
    const email = v.trim();
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    if (/^\d+$/.test(v)) return "Password can't be only numbers";
    return "";
  },
  confirmPassword: (v, f) => {
    if (!v) return "Please confirm your password";
    if (v !== f.password) return "Passwords do not match";
    return "";
  },
  role: (v) => (v ? "" : "Select a role"),
  otherCategory: (v, f) =>
    f.role === "Others" && !v.trim() ? "Enter your professional role" : "",
};

const validateAll = (f) =>
  Object.keys(validators).reduce(
    (acc, key) => ({ ...acc, [key]: validators[key](f[key], f) }),
    {}
  );


const SERVER_FIELD_MAP = {
  username: "email",
  email: "email",
  password1: "password",
  password2: "password",
  password: "password",
  first_name: "fullName",
  last_name: "fullName",
};

const firstMessage = (v) => (Array.isArray(v) ? v.join(" ") : String(v));

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 1)}@${domain}`;
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };

    
    if (name === "role" && value !== "Others") nextForm.otherCategory = "";

    setForm(nextForm);

    setErrors((prev) => {
      const next = { ...prev };

      if (prev[name]) next[name] = validators[name](value, nextForm);

      if (name === "password" && nextForm.confirmPassword) {
        next.confirmPassword = validators.confirmPassword(nextForm.confirmPassword, nextForm);
      }
      if (name === "role" && value !== "Others") next.otherCategory = "";
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validators[name](value, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess(false);

    const nextErrors = validateAll(form);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const email = form.email.trim().toLowerCase();
    const [firstName, ...rest] = form.fullName.trim().split(/\s+/);
    const professionalRole =
      form.role === "Others" ? form.otherCategory.trim() : form.role;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/registration/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          first_name: firstName,
          last_name: rest.join(" "),
          email,
          password1: form.password,
          password2: form.password,
          
          professional_role: professionalRole,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
      
        const fieldErrors = { ...EMPTY_ERRORS };
        let handled = false;
        Object.entries(SERVER_FIELD_MAP).forEach(([serverKey, field]) => {
          if (data[serverKey]) {
            fieldErrors[field] = fieldErrors[field] || firstMessage(data[serverKey]);
            handled = true;
          }
        });
        if (data.professional_role) {
          fieldErrors.role = firstMessage(data.professional_role);
          handled = true;
        }
        if (handled) setErrors((prev) => ({ ...prev, ...fieldErrors }));

        const general = data.non_field_errors?.[0] || data.detail;
        if (general) {
          setServerError(general);
        } else if (!handled) {
          setServerError("Registration failed. Please try again.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const errorText = (id, msg) =>
    msg ? (
      <p id={`${id}-error`} role="alert" className="-mt-2 mb-3 text-[0.8rem] text-red-600">
        {msg}
      </p>
    ) : null;

  const fieldProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="mx-auto my-32 w-full max-w-[400px] rounded-xl bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,31,61,0.08)] max-[480px]:px-5 max-[480px]:py-6">
      <div className="flex items-center justify-center gap-2">
        <img src={LogoImage} alt="Logo" className="h-auto w-7" />
        <h1 className="text-[22px] font-semibold tracking-wide text-[#17324D] max-[480px]:text-lg">
          PROJECT FINDER
        </h1>
      </div>
      <h3 className="my-5 mb-6 text-[1.4rem] text-slate-500 max-[480px]:my-4 max-[480px]:mb-5 max-[480px]:text-xl">
        Create your account
      </h3>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col text-left">
        <label htmlFor="fullName" className="mb-1.5 text-sm font-medium text-slate-900">
          Full Name
        </label>
        <input
          {...fieldProps("fullName")}
          type="text"
          placeholder="Enter your full name"
          autoComplete="name"
          className={`${inputBase} mb-3.5 ${errors.fullName ? inputError : ""}`}
        />
        {errorText("fullName", errors.fullName)}

        <label htmlFor="email" className="mb-1.5 text-sm font-medium text-slate-900">
          Email Address
        </label>
        <input
          {...fieldProps("email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={`${inputBase} mb-3.5 ${errors.email ? inputError : ""}`}
        />
        {errorText("email", errors.email)}

        <label htmlFor="role" className="mb-1.5 text-sm font-medium text-slate-900">
          Professional Role
        </label>
        <select
          {...fieldProps("role")}
          className={`${inputBase} mb-3.5 ${errors.role ? inputError : ""}`}
        >
          <option value="">Select your role</option>
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
        {errorText("role", errors.role)}

        {form.role === "Others" && (
          <>
            <label
              htmlFor="otherCategory"
              className="mb-1.5 text-sm font-medium text-slate-900"
            >
              Specify your role
            </label>
            <input
              {...fieldProps("otherCategory")}
              type="text"
              placeholder="Enter your professional role"
              className={`${inputBase} mb-3.5 ${errors.otherCategory ? inputError : ""}`}
            />
            {errorText("otherCategory", errors.otherCategory)}
          </>
        )}

        <label htmlFor="password" className="mb-1.5 text-sm font-medium text-slate-900">
          Password
        </label>
        <div className="relative mb-3.5">
          <input
            {...fieldProps("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password (min 8 characters)"
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
        {errorText("password", errors.password)}

        <label
          htmlFor="confirmPassword"
          className="mb-1.5 text-sm font-medium text-slate-900"
        >
          Confirm Password
        </label>
        <input
          {...fieldProps("confirmPassword")}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          className={`${inputBase} mb-3.5 ${errors.confirmPassword ? inputError : ""}`}
        />
        {errorText("confirmPassword", errors.confirmPassword)}

        {serverError && (
          <div
            role="alert"
            className="mb-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-left text-sm text-red-800"
          >
            <p className="font-semibold">Registration failed</p>
            <p className="mt-1 text-red-700">{serverError}</p>
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-left text-sm text-green-800">
            <p className="font-semibold">Registration successful</p>
            <p className="mt-1 text-green-700">
              We have sent a verification link to{" "}
              <strong>{maskEmail(form.email.trim().toLowerCase())}</strong>. Please check your
              inbox and click the link to activate your account.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="mt-1.5 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 max-[480px]:min-h-[44px]"
        >
          {loading ? "Creating account..." : success ? "Email Sent" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <NavLink to="/login" className="font-medium text-blue-600 hover:underline">
          Sign In
        </NavLink>
      </p>
    </div>
  );
};

export default SignUp;