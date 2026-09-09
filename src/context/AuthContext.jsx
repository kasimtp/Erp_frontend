import { createContext, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("bms_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("bms_token");
      if (token && token !== "demo-token") {
        try {
          const { data } = await client.get("/auth/me");
          if (data.success && data.data.user) {
            setUser(data.data.user);
            localStorage.setItem("bms_user", JSON.stringify(data.data.user));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            localStorage.removeItem("bms_token");
            localStorage.removeItem("bms_user");
            setUser(null);
          }
        }
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await client.post("/auth/login", { email, password });
      const user = data.data.user;
      const token = data.data.token;
      localStorage.setItem("bms_token", token);
      localStorage.setItem("bms_user", JSON.stringify(user));
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, phone, password }) => {
    setLoading(true);
    try {
      const { data } = await client.post("/auth/register", { name, email, phone, password });
      const user = data.data.user;
      const token = data.data.token;
      localStorage.setItem("bms_token", token);
      localStorage.setItem("bms_user", JSON.stringify(user));
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    const demoUser = { name: "Demo Admin", email: "admin@example.com", role: "Admin" };
    localStorage.setItem("bms_token", "demo-token");
    localStorage.setItem("bms_user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    const token = localStorage.getItem("bms_token");
    if (token && token !== "demo-token") {
      try {
        await client.post("/auth/logout");
      } catch (e) {
        // ignore logout network errors
      }
    }
    localStorage.removeItem("bms_token");
    localStorage.removeItem("bms_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, demoLogin, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

