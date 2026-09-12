import { useSettings } from "../context/SettingsContext.jsx";
import { GraduationCap } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://al-maarif-education-system.onrender.com";

export default function Logo({ size = 40, showName = true, dark = false }) {
  const { settings } = useSettings();
  const logoSrc = settings?.logoUrl?.startsWith("data:") 
    ? settings.logoUrl 
    : (settings?.logoUrl ? `${API_URL}${settings.logoUrl}` : null);

  return (
    <div className="flex items-center gap-2">
      {logoSrc ? (
        <img src={logoSrc} alt="School Logo" style={{ width: size, height: size }} className="rounded-lg object-cover" />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-gold-300"
        >
          <GraduationCap size={size * 0.6} />
        </div>
      )}
      {showName && (
        <div className="leading-tight">
          <p className={`font-bold ${dark ? "text-white" : "text-primary-800"}`} style={{ fontSize: size * 0.34 }}>
            {settings?.schoolName || "Al-Maarif Education"}
          </p>
          <p className={`${dark ? "text-primary-200" : "text-gray-500"}`} style={{ fontSize: size * 0.22 }}>
            School Management System
          </p>
        </div>
      )}
    </div>
  );
}
