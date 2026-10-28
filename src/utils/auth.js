const TOKEN_KEY = "token";
const REFRESH_KEY = "refresh";
const USER_KEY = "user";

const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const isTokenValid = (token) => {
  if (!token) return false;
  const payload = decodeToken(token);
  if (payload?.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
};

export const isLoggedIn = () => isTokenValid(getToken());


export const setSession = (data) => {
  try {
    localStorage.setItem(TOKEN_KEY, data.access);
    if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
    if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  } catch {
    
  }
};

export const getCurrentUser = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY));
    if (saved) return saved;
  } catch {
    
  }
  
  return decodeToken(getToken() || "");
};

export const logout = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    
  }
};

export const isAdmin = (user) =>
  Boolean(
    user?.is_staff ||
      user?.is_superuser ||
      user?.is_admin ||
      String(user?.role || user?.user_type || "").toLowerCase() === "admin"
  );