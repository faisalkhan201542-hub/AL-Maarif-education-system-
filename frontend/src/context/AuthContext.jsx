import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [principal, setPrincipal] = useState(() => {
    const saved = localStorage.getItem("ame_principal");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ame_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((res) => {
        setPrincipal(res.data);
        localStorage.setItem("ame_principal", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("ame_token");
        localStorage.removeItem("ame_principal");
        setPrincipal(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (whatsapp, password) => {
    const res = await api.post("/api/auth/login", { whatsapp, password });
    localStorage.setItem("ame_token", res.data.token);
    localStorage.setItem("ame_principal", JSON.stringify(res.data));
    setPrincipal(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("ame_token");
    localStorage.removeItem("ame_principal");
    setPrincipal(null);
  };

  return (
    <AuthContext.Provider value={{ principal, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
