import { getToken, logout } from "./auth";

export const API_BASE = "https://project-finder-q5t2.onrender.com/api";

export const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    logout();
    window.location.assign("/login");
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.status === 204 ? null : res.json();
};

// handles both a plain array and a paginated { count, results } response
export const toList = (data) => (Array.isArray(data) ? data : data?.results ?? []);
export const toCount = (data) =>
  Array.isArray(data) ? data.length : data?.count ?? toList(data).length;