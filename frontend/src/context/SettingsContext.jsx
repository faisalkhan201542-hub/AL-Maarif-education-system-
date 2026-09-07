import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  schoolName: "Al-Maarif Education",
  address: "512, Near Professor Colony",
  principalName: "Murad Khalil",
  principalWhatsapp: "+923139163732",
  easypaisaNumber: "+923139163732",
  easypaisaAccountName: "Murad Khalil",
  logoUrl: "",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/api/settings");
      setSettings(res.data);
    } catch {
      // fall back to defaults silently (e.g. before backend/seed has run)
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
