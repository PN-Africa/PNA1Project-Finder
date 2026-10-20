const KEY = "profile";

const defaultProfile = {
  fullName: "Sarah Wilson",
  email: "sarah@email.com",
  role: "Business Analyst",
  registrationDate: "2026-09-23",
};

export const roles = [
  "Project Manager",
  "Project Coordinator",
  "Project Support Officer",
  "Project Delivery Support Officer",
  "Project Officer",
  "Business Analyst",
];

export const getProfile = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...defaultProfile, ...saved } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable, ignore */
  }
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });