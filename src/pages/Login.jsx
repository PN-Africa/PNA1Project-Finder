import React, { useState } from "react";
import LogoImage from "../assets/logo.jpg";
import { useNavigate, NavLink } from "react-router";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[0.95rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 transition sm:text-base";
const inputError =
  "border-red-600 focus:border-red-600 focus:ring-red-600/15";

const Login = () => {
  const navigate = useNavigate();

  const [view, setView] = useState("signin"); // "signin" | "forgot" | "forgot-sent"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email:
          value === ""
            ? "Email is required"
            : !emailRegex.test(value)
            ? "Invalid email format"
            : "",
      }));
    }
    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value === "" ? "Password is required" : "",
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError("");

    const nextErrors = {
      email:
        form.email === ""
          ? "Email is required"
          : !emailRegex.test(form.email)
          ? "Invalid email format"
          : "",
      password: form.password === "" ? "Password is required" : "",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(
          data.detail ||
            data.non_field_errors?.[0] ||
            data.email?.[0] ||
            data.password?.[0] ||
            "Login failed. Check your email and password."
        );
        return;
      }
     localStorage.setItem("token", data.access);
if (data.refresh) localStorage.setItem("refresh", data.refresh);

const u = data.user ?? {};
const isAdmin = u.is_staff || u.is_superuser || u.role === "admin";
navigate(isAdmin ? "/admin/submissions" : "/project-library");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail) return setForgotError("Email is required");
    if (!emailRegex.test(forgotEmail)) return setForgotError("Invalid email format");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        setForgotError(
          data.email?.[0] || data.detail || "Could not send reset email. Try again."
        );
        return;
      }
      setView("forgot-sent");
    } catch {
      setForgotError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-32 w-full max-w-[400px] rounded-xl bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,31,61,0.08)] max-[480px]:px-5 max-[480px]:py-6">
      {/* Logo / heading */}
      <div className="flex items-center justify-center gap-2">
        <img src={LogoImage} alt="Logo" className="h-auto w-7" />
        <h1 className="text-[22px] font-semibold tracking-wide text-[#17324D] max-[480px]:text-lg">
          PROJECT FINDER
        </h1>
      </div>

      {/* ============ SIGN IN ============ */}
      {view === "signin" && (
        <>
          <h3 className="my-5 mb-6 text-[1.4rem] text-slate-500 max-[480px]:my-4 max-[480px]:mb-5 max-[480px]:text-xl">
            Welcome Back
          </h3>

          <form onSubmit={handleLogin} noValidate className="flex flex-col text-left">
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
            {errors.email && (
              <p className="-mt-2 mb-3 text-[0.8rem] text-red-600">{errors.email}</p>
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
                autoComplete="current-password"
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
            {errors.password && (
              <p className="-mt-2 mb-3 text-[0.8rem] text-red-600">{errors.password}</p>
            )}

            {serverError && (
              <p className="mb-3 rounded-md border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-800">
                {serverError}
              </p>
            )}

            <div className="mb-3 flex justify-end">
              <span
                role="button"
                tabIndex={0}
                onClick={() => {
                  setView("forgot");
                  setForgotEmail(form.email);
                  setForgotError("");
                  setServerError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setView("forgot");
                    setForgotEmail(form.email);
                    setForgotError("");
                    setServerError("");
                  }
                }}
                className="cursor-pointer select-none text-sm text-slate-700 hover:text-slate-900 hover:underline"
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1.5 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 max-[480px]:min-h-[44px]"
            >
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>

          <p className="p-2 text-sm text-slate-600">
            Don't have an account?{" "}
            <NavLink to="/signup" className="font-medium text-blue-600 hover:underline">
              Sign Up
            </NavLink>
          </p>
        </>
      )}

      {/* ============ FORGOT ============ */}
      {view === "forgot" && (
        <>
          <h3 className="my-5 mb-6 text-[1.4rem] text-slate-500 max-[480px]:my-4 max-[480px]:mb-5 max-[480px]:text-xl">
            Reset your password
          </h3>
          <p className="mb-4 text-left text-sm leading-relaxed text-slate-500">
            Enter the email tied to your account. We'll send a reset link.
          </p>

          <form onSubmit={handleForgot} noValidate className="flex flex-col text-left">
            <label htmlFor="forgot-email" className="mb-1.5 text-sm font-medium text-slate-900">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              name="forgot-email"
              value={forgotEmail}
              placeholder="you@example.com"
              onChange={(e) => {
                setForgotEmail(e.target.value);
                setForgotError("");
              }}
              autoComplete="email"
              className={`${inputBase} mb-3.5 ${forgotError ? inputError : ""}`}
            />
            {forgotError && (
              <p className="-mt-2 mb-3 text-[0.8rem] text-red-600">{forgotError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1.5 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 max-[480px]:min-h-[44px]"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <button
              type="button"
              onClick={() => setView("signin")}
              className="mt-4 inline-block self-start text-sm text-slate-700 hover:text-slate-900 hover:underline"
            >
              ← Back to sign in
            </button>
          </form>
        </>
      )}

      {/* ============ FORGOT-SENT ============ */}
      {view === "forgot-sent" && (
        <>
          <h3 className="my-5 mb-6 text-[1.4rem] text-slate-500 max-[480px]:my-4 max-[480px]:mb-5 max-[480px]:text-xl">
            Check your email
          </h3>
          <p className="mb-4 text-left text-sm leading-relaxed text-slate-500">
            If an account exists for <strong>{forgotEmail}</strong>, a reset link is on
            its way. Check spam too.
          </p>
          <button
            type="button"
            onClick={() => setView("signin")}
            className="mt-2 inline-block self-start text-sm text-slate-700 hover:text-slate-900 hover:underline"
          >
            ← Back to sign in
          </button>
        </>
      )}
    </div>
  );
};

export default Login;