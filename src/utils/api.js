import { getToken, logout } from "./auth";

export const API_BASE = "https://project-finder-q5t2.onrender.com/api";

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    console.warn(`401 Unauthorized on ${path}. Token might be expired.`);
    
    throw new Error("Session expired. Please log in again.");
  }
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed (${res.status})`);
  }
  
  return res.status === 204 ? null : res.json();
};

export const toList = (data) => (Array.isArray(data) ? data : data?.results ?? []);
export const toCount = (data) =>
  Array.isArray(data) ? data.length : data?.count ?? toList(data).length;