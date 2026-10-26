const API_BASE = "https://project-finder-q5t2.onrender.com/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Turns a DRF error body like { project: ["This field is required."] } into one readable line
async function readError(res) {
  const data = await res.json().catch(() => ({}));
  const first = Object.values(data).flat()[0];
  return data.detail || (typeof first === "string" ? first : `Request failed (${res.status})`);
}

// POST /api/simulations/  -> starts a simulation for the logged-in user
// The body field name is a guess ("project"); the error message will say if it differs.
export async function startSimulation(projectId) {
  const res = await fetch(`${API_BASE}/simulations/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ project: projectId }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json(); // the new simulation (use its id for the next steps)
}

// GET /api/simulations/{id}/  -> one simulation's details
export async function getSimulation(id) {
  const res = await fetch(`${API_BASE}/simulations/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

// GET /api/projects/{id}/  -> used when a simulation only holds the project's id
export async function getProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

// POST /api/simulations/{id}/submit/  -> marks the simulation as submitted.
// Files go as multipart form data (field name "files" is a guess: check the docs' request body).
export async function submitSimulation(id, files = []) {
  const body = new FormData();
  files.forEach((f) => body.append("files", f));
  const res = await fetch(`${API_BASE}/simulations/${id}/submit/`, {
    method: "POST",
    headers: authHeaders(), // no Content-Type: the browser sets it for FormData
    body,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json().catch(() => ({}));
}