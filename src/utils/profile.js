const API_BASE = "https://project-finder-q5t2.onrender.com/api";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const roles = [
  "Project Manager",
  "Project Coordinator",
  "Project Support Officer",
  "Project Delivery Support Officer",
  "Project Officer",
  "Business Analyst",
  "Others",
];

const readError = async (res) => {
  const data = await res.json().catch(() => ({}));
  return data.detail || Object.values(data).flat?.()[0] || `Request failed (${res.status})`;
};


export async function fetchProfile() {
  const res = await fetch(`${API_BASE}/auth/user/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();

  return {
    id: data.id,
    fullName: [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || "",
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    email: data.email || "",
    role: data.professional_role || data.role || "",
    registrationDate: data.date_joined || data.created_at || "",
  };
}


export async function updateProfile(profile) {
  const payload = {
    first_name: profile.firstName || profile.fullName?.split(" ")[0] || "",
    last_name: profile.lastName || profile.fullName?.split(" ").slice(1).join(" ") || "",
    email: profile.email,
  };
  
  if (profile.role) payload.professional_role = profile.role;

  const res = await fetch(`${API_BASE}/auth/user/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();

  
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  localStorage.setItem(
    "user",
    JSON.stringify({ ...stored, ...data, first_name: payload.first_name, last_name: payload.last_name, email: payload.email })
  );

  return data;
}


export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}