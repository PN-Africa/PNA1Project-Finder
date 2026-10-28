// src/utils/simulation.js
const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("access") || "";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Coerce to number if it looks like one, otherwise leave as-is (UUIDs, etc.)
const normalizeId = (v) => {
  if (v == null) return v;
  const n = Number(v);
  return Number.isFinite(n) && String(n) === String(v).trim() ? n : v;
};

// DRF returns errors like:
//   { "detail": "..." }
//   { "project": ["This field is required."] }
//   { "non_field_errors": ["..."] }
// This flattens them into one readable string.
async function readError(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* not JSON */
  }
  if (!data) return `Request failed (${res.status})`;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  const first = Object.values(data).flat?.()[0];
  if (typeof first === "string") return first;
  return `Request failed (${res.status})`;
}

// Unwrap a create/get response that might be wrapped in { simulation: {...} } or { data: {...} }
const unwrapSimulation = (raw) => {
  if (!raw || typeof raw !== "object") return raw;
  if (raw.simulation && typeof raw.simulation === "object") return raw.simulation;
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw;
};

// POST /api/simulations/  -> starts a simulation for the logged-in user
export async function startSimulation(projectId) {
  const id = normalizeId(projectId);

  const payload = { project: id, project_id: id };

  const res = await fetch(`${API_BASE}/simulations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await readError(res);
    console.error("startSimulation failed:", {
      status: res.status,
      sentPayload: payload,
      errorMessage: msg,
    });
    throw new Error(msg);
  }

  const raw = await res.json();
  console.log("startSimulation response:", raw); // remove later
  return unwrapSimulation(raw);
}

// GET /api/simulations/{id}/  -> one simulation's details
export async function getSimulation(id) {
  const res = await fetch(`${API_BASE}/simulations/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const raw = await res.json();
  return unwrapSimulation(raw);
}

// GET /api/projects/{id}/
export async function getProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

// POST /api/simulations/{id}/submit/  -> marks the simulation as submitted
export async function submitSimulation(id, files = []) {
  const body = new FormData();
  files.forEach((f) => body.append("files", f));

  const res = await fetch(`${API_BASE}/simulations/${id}/submit/`, {
    method: "POST",
    headers: authHeaders(), // browser sets multipart Content-Type automatically
    body,
  });

  if (!res.ok) throw new Error(await readError(res));
  return res.json().catch(() => ({}));
}