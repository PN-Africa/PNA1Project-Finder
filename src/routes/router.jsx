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
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Submissions, { UserProfilePage } from "../pages/admin/Submissions";
import Simulationprojects from "../pages/admin/Simulationprojects";
import AdminProfile from "../pages/admin/Profile";
import { ProtectedRoute, GuestRoute } from "../components/common/ProtectedRoute";
import ProjectForm from "../pages/admin/ProjectForm";
import MySimulations from "../pages/MySimulations";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/signup", element: <SignUp /> },
          { path: "/reset-password", element: <ResetPassword /> },
          { path: "/verify-email", element: <VerifyEmail /> },
          { path: "/reset-password/:uid/:token", element: <ResetPassword /> },
{ path: "/verify-email/:key", element: <VerifyEmail /> },
        ],
      },
    ],
  },

  
  {
    element: <ProtectedRoute />,
    children: [
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
          { path: "/my-simulations", element: <MySimulations /> },

        ],
      },
    ],
  },

  {
    element: <ProtectedRoute adminOnly />, 
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "users", element: <Users /> },
          { path: "users/:userId", element: <UserProfilePage /> },
          { path: "submissions", element: <Submissions /> },
          { path: "simulation-projects", element: <Simulationprojects /> },
          { path: "profile", element: <AdminProfile /> },
          { path: "simulation-projects", element: <Simulationprojects /> },
{ path: "simulation-projects/new", element: <ProjectForm /> },
{ path: "simulation-projects/:id/edit", element: <ProjectForm /> },
        ],
      },
    ],
  },
]);

export default router;