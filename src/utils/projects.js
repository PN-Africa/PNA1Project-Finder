const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("access") || "";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

async function readError(res) {
  const data = await res.json().catch(() => null);
  if (!data) return `Request failed (${res.status})`;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data).flat?.()[0];
  if (typeof first === "string") return first;
  return `Request failed (${res.status})`;
}

const toList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.data)) return res.data;
  return [];
};


export async function listAvailableProjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  // Based on swagger, /api/projects/available/ exists
  const res = await fetch(`${API_BASE}/projects/available/${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}


export async function listProjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  
  const res = await fetch(`${API_BASE}/projects/${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createProject(payload) {
  
  const res = await fetch(`${API_BASE}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getAdminProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updateProject(id, payload) {
  
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function deleteProject(id) {
  
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error(await readError(res));
}

export async function setProjectPublished(id, publish) {
  return updateProject(id, { published: publish });
}

export { toList };