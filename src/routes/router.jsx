import { createBrowserRouter, Navigate } from "react-router";
import EditedProfile from "../pages/EditedProfile";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import EditProfile from "../pages/EditProfile";
import ProjectDetail from "../pages/ProjectDetail";
import Simulation from "../pages/Simulation";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProjectLibary from "../pages/ProjectLibary";
import Profile from "../pages/Profile";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
    ],
  },
  {
    element: <MainLayout />,
   children: [
  { path: "/project-library", element: <ProjectLibary /> },
  { path: "/project/:id", element: <ProjectDetail /> },
  { path: "/simulation", element: <Navigate to="/project-library" replace /> },
  { path: "/simulation/:id", element: <Simulation /> },
  { path: "/edit-profile", element: <EditProfile /> },
  { path: "/edited-profile", element: <EditedProfile /> },
  { path: "/profile", element: <Profile /> },
],
  },
]);

export default router;