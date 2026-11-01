// src/utils/simulation.js
const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const getToken = () => localStorage.getItem("token") || localStorage.getItem("access") || "";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

async function readError(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    
  }
  if (!data) return `Request failed (${res.status})`;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data).flat?.()[0];
  if (typeof first === "string") return first;
  return `Request failed (${res.status})`;
}

const unwrapSimulation = (raw) => {
  if (!raw || typeof raw !== "object") return raw;
  if (raw.simulation && typeof raw.simulation === "object") return raw.simulation;
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw;
};

export async function getSimulation(id) {
  const res = await fetch(`${API_BASE}/simulations/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const raw = await res.json();
  return unwrapSimulation(raw);
}

export async function startSimulation(projectId) {
  const res = await fetch(`${API_BASE}/simulations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ project: projectId, project_id: projectId }),
  });
  if (!res.ok) {
    const msg = await readError(res);
    console.error("startSimulation failed:", msg);
    throw new Error(msg);
  }
  return unwrapSimulation(await res.json());
}

export async function getProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

// ⬇️ UPDATED: Uses /simulations/{id}/uploads/ to match the new backend
export async function submitSimulation(id, files = []) {
  const body = new FormData();
  

  files.forEach((f) => {
    body.append("file", f);
    body.append("files", f);
  });

  const res = await fetch(`${API_BASE}/simulations/${id}/uploads/`, {
    method: "POST",
    headers: authHeaders(), 
    body,
  });

  if (!res.ok) {
    const errorMsg = await readError(res);
    console.error("Upload failed:", errorMsg);
    throw new Error(errorMsg);
  }
  
  return res.json().catch(() => ({}));
}

export async function getSimulations() {
  const res = await fetch(`${API_BASE}/simulations/?page_size=100`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return Array.isArray(data) ? data : data.results ?? [];
}