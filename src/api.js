
const USE_MOCK = false; 
const BASE = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`, 
});

const MOCK_SUBMISSIONS = [
  { id: 1, user: "Sarah Wilson", project: "Healthcare Improvement Process", industry: "Healthcare", difficulty: "Intermediate", status: "In Progress", uploads: 2 },
  { id: 2, user: "Mark Lauren", project: "Customer Analysis", industry: "E-commerce", difficulty: "Beginner", status: "Submitted", uploads: 4 },
  { id: 3, user: "Sarah Wilson", project: "Healthcare Improvement Process", industry: "Healthcare", difficulty: "Intermediate", status: "In Progress", uploads: 2 },
  { id: 4, user: "Mark Lauren", project: "Customer Analysis", industry: "E-commerce", difficulty: "Beginner", status: "Submitted", uploads: 4 },
];

const MOCK_USERS = {
  1: { id: 1, fullName: "Sarah Wilson", email: "sarah@email.com", role: "Business Analyst", registeredAt: "2026-09-23", simulations: MOCK_SUBMISSIONS.slice(0, 1) },
  2: { id: 2, fullName: "Ada Obi", email: "ada@email.com", role: "Data Analyst", registeredAt: "2026-09-25", simulations: [] }, // empty state
};

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

async function request(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}


const toRow = (x) => ({
  id: x.id,
  user: x.user_name ?? x.user?.full_name ?? x.user?.name ?? x.user?.email ?? x.user ?? "—",
  project: x.project?.title ?? x.project_title ?? x.project?.name ?? x.title ?? x.project ?? "—",
  industry: x.project?.industry ?? x.industry ?? "—",
  difficulty: x.project?.difficulty ?? x.difficulty ?? "—",
  status: x.status ?? "—",
  uploads: x.uploads_count ?? x.uploads?.length ?? x.uploads ?? 0,
});

export async function getSubmissions({ page = 1, status = "" } = {}) {
  if (USE_MOCK) {
    await wait();
    const results = MOCK_SUBMISSIONS.filter((s) => !status || s.status === status);
    return { results, count: results.length };
  }
  const data = await request(`/api/simulations/?page=${page}&page_size=10`);
  console.log("RAW simulations response:", data);
  const list = Array.isArray(data) ? data : data.results ?? [];
  let results = list.map(toRow);
  
  if (status) results = results.filter((r) => r.status.toLowerCase().replace(/_/g, " ") === status.toLowerCase());
  return { results, count: data.count ?? results.length };
}


export async function getUserProfile(userId) {
  if (true || USE_MOCK) { 
    await wait();
    return MOCK_USERS[userId] ?? MOCK_USERS[2];
  }
  return request(`/api/users/${userId}/`);
}