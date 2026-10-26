import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { isLoggedIn, getCurrentUser, isAdmin } from "../../utils/auth";

export const ProtectedRoute = ({ adminOnly = false }) => {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin(getCurrentUser())) {
    return <Navigate to="/project-library" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  if (isLoggedIn()) {
    return <Navigate to={isAdmin(getCurrentUser()) ? "/admin" : "/project-library"} replace />;
  }
  return <Outlet />;
};