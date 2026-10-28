const API_BASE = "https://project-finder-q5t2.onrender.com/api";

export async function logout(navigate) {
  const token = localStorage.getItem("token");
  const refresh = localStorage.getItem("refresh");

  try {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    navigate("/login");
  }
}