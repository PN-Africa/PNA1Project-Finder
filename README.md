# Project Finder

A web app that connects users with real-world project simulations. Users can browse a project library, start simulations, and submit their work. Admins manage users, submissions, and projects through an admin dashboard.

## Features

- Authentication: login, signup, forgot password
- Project library: browse and search available projects
- Simulations: start a project, track time, submit deliverables
- Profile: view and edit user info
- Admin panel: dashboard, users, submissions, project management

## Tech Stack

Frontend:
- React 18
- React Router v7
- Tailwind CSS
- Vite
- react-icons

Backend:
- Django REST Framework
- SimpleJWT / djoser for authentication
- Hosted on Render

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/project_finder.git
cd project_finder
npm install


src/
├── api/              API helper functions
├── assets/           Images, logos
├── components/       Reusable UI components
│   ├── common/       ProtectedRoute, shared widgets
│   └── user/         User-facing components
├── context/          React context (AdminDataProvider)
├── layouts/          AuthLayout, MainLayout, AdminLayout
├── pages/
│   ├── admin/        Admin pages (Dashboard, Users, etc.)
│   ├── Login.jsx
│   ├── SignUp.jsx
│   └── ...
├── utils/            Helpers (auth, api, simulation)
├── router.jsx        App routing
└── main.jsx          Entry point
