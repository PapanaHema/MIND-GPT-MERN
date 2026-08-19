import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const TOKEN_KEY = "mindgpt_token";

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data;
  };
  const login = async (email, password) => {
    const data = await request("/api/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    });
    return saveSession(data);
  };
  const signup = async (name, email, password) => {
    const data = await request("/api/auth/signup", {
      method: "POST", body: JSON.stringify({ name, email, password }),
    });
    return saveSession(data);
  };
  const forgotPassword = (email) => request("/api/auth/forgot-password", {
    method: "POST", body: JSON.stringify({ email }),
  });
  const resetPassword = (email, code, password) => request("/api/auth/reset-password", {
    method: "POST", body: JSON.stringify({ email, code, password }),
  });
  const updateProfilePicture = async (profilePicture) => {
    const data = await request("/api/auth/profile-picture", {
      method: "PUT",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
      body: JSON.stringify({ profilePicture }),
    });
    setUser(data.user);
    return data.user;
  };
  const removeProfilePicture = async () => {
    const data = await request("/api/auth/profile-picture", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    });
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword, resetPassword, updateProfilePicture, removeProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
