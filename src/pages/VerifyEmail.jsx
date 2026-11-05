import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import LogoImage from "../assets/logo.jpg";

const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const key = searchParams.get("key");

    if (!key) {
      setStatus("error");
      setError("The verification link is missing a required token. Please check the URL or request a new verification email.");
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
          throw new Error(data.detail || "This verification link is invalid or has expired. Please request a new one.");
        }

        setStatus("success");
        
        setTimeout(() => {
          navigate("/login?verified=true");
        }, 3000);

      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="mx-auto my-32 w-full max-w-[400px] rounded-xl bg-white px-7 py-8 text-center shadow-[0_2px_12px_rgba(15,31,61,0.08)]">
      <div className="flex items-center justify-center gap-2">
        <img src={LogoImage} alt="Logo" className="h-auto w-7" />
        <h1 className="text-[22px] font-semibold tracking-wide text-[#17324D]">
          PROJECT FINDER
        </h1>
      </div>

      {status === "verifying" && (
        <div className="mt-8">
          <h3 className="text-[1.2rem] font-medium text-slate-700">Verifying your account</h3>
          <p className="mt-2 text-sm text-slate-500">
            Please wait while we confirm your email address.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-8">
          <h3 className="text-[1.2rem] font-semibold text-green-700">Email verified successfully</h3>
          <p className="mt-2 text-sm text-slate-500">
            Your account is now active. You will be redirected to the login page momentarily.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-[#17324D] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f2436]"
          >
            Proceed to Login
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8">
          <h3 className="text-[1.2rem] font-semibold text-red-600">Verification failed</h3>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-[#17324D] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f2436]"
          >
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;