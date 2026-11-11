const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const getToken = () => localStorage.getItem("token") || localStorage.getItem("access") || "";
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

async function readError(res) {
  let data = null;
  try { data = await res.json(); } catch {}
  if (!data) return `Request failed (${res.status})`;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data).flat?.()[0];
  if (typeof first === "string") return first;
  return `Request failed (${res.status})`;
}

export async function getSimulation(id) {
  const res = await fetch(`${API_BASE}/simulations/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function startSimulation(projectId) {
  const res = await fetch(`${API_BASE}/simulations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ project: projectId, project_id: projectId }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function getProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function uploadSimulationFile(simulationId, file) {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_BASE}/simulations/${simulationId}/uploads/`, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json().catch(() => ({}));
}

export async function deleteSimulationFile(simulationId, uploadId) {
  const res = await fetch(`${API_BASE}/simulations/${simulationId}/uploads/${uploadId}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new Error(await readError(res));
}

export async function submitSimulation(id) {
  const res = await fetch(`${API_BASE}/simulations/${id}/submit/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json().catch(() => ({}));
}

export async function getSimulations() {
  const res = await fetch(`${API_BASE}/simulations/?page_size=100`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}