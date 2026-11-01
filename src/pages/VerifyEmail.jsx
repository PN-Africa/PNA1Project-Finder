import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import LogoImage from "../assets/logo.jpg";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const key = searchParams.get("key");

    if (!key) {
      setStatus("error");
      setError("Missing verification key in the URL.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/registration/verify-email/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Verification failed. The link may have expired.");
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="mx-auto my-32 w-full max-w-[400px] rounded-xl bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,31,61,0.08)]">
      <div className="flex items-center justify-center gap-2">
        <img src={LogoImage} alt="Logo" className="h-auto w-7" />
        <h1 className="text-[22px] font-semibold tracking-wide text-[#17324D]">
          PROJECT FINDER
        </h1>
      </div>

      {status === "verifying" && (
        <p className="mt-6 text-sm text-slate-500">Verifying your email...</p>
      )}

      {status === "success" && (
        <>
          <h3 className="mt-6 mb-3 text-[1.4rem] text-green-600">Email Verified!</h3>
          <p className="mb-6 text-sm text-slate-500">
            Your account is now active. You can log in.
          </p>
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h3 className="mt-6 mb-3 text-[1.4rem] text-red-600">Verification Failed</h3>
          <p className="mb-6 text-sm text-red-500">{error}</p>
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;