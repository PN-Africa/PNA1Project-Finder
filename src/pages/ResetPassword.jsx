import React, { useState } from "react";
import LogoImage from "../assets/logo.jpg";
import { Link, useSearchParams, useNavigate, useParams } from "react-router";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[0.95rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 transition sm:text-base";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { uid: pathUid, token: pathToken } = useParams();
  const navigate = useNavigate();

  // Read from ?uid=... OR from /uid/token/
  const uid = searchParams.get("uid") || pathUid;
  const token = searchParams.get("token") || pathToken;

  const [newPassword, setNewPassword] = useState("");
  const [reNewPassword, setReNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!uid || !token) {
      return setError("Invalid or missing reset token in the URL.");
    }
    if (newPassword.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (newPassword !== reNewPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/password/reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          uid, 
          token, 
          new_password1: newPassword, 
          new_password2: reNewPassword 
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.new_password1?.[0] || "Could not reset password. The link may have expired.");
      }

      navigate("/login?reset=success");
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-32 w-full max-w-[400px] rounded-xl bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,31,61,0.08)] max-[480px]:px-5 max-[480px]:py-6">
      <div className="flex items-center justify-center gap-2">
        <img src={LogoImage} alt="Logo" className="h-auto w-7" />
        <h1 className="text-[22px] font-semibold tracking-wide text-[#17324D] max-[480px]:text-lg">
          PROJECT FINDER
        </h1>
      </div>

      <h3 className="my-5 mb-6 text-[1.4rem] text-slate-500">
        Set new password
      </h3>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col text-left">
        <label htmlFor="newPassword" className="mb-1.5 text-sm font-medium text-slate-900">
          New Password
        </label>
        <div className="relative mb-3.5">
          <input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputBase}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center bg-transparent p-0 text-slate-500"
          >
            {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
          </button>
        </div>

        <label htmlFor="reNewPassword" className="mb-1.5 text-sm font-medium text-slate-900">
          Confirm New Password
        </label>
        <div className="relative mb-3.5">
          <input
            id="reNewPassword"
            type={showPassword ? "text" : "password"}
            value={reNewPassword}
            onChange={(e) => setReNewPassword(e.target.value)}
            className={inputBase}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-left text-sm text-red-800">
            <p className="font-semibold">Reset failed</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1.5 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 max-[480px]:min-h-[44px]"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <Link
          to="/login"
          className="mt-4 inline-block self-start text-sm text-slate-700 hover:text-slate-900 hover:underline"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
};

export default ResetPassword;