import { MessageCircle } from "lucide-react";
import { buildWhatsappLink } from "../utils/format.js";

export default function WhatsAppButton({ phone, message = "", label = "WhatsApp", className = "btn-whatsapp btn-sm" }) {
  if (!phone) return null;
  const handleClick = (e) => {
    e.stopPropagation();
    window.open(buildWhatsappLink(phone, message), "_blank", "noopener,noreferrer");
  };
  return (
    <button type="button" onClick={handleClick} className={className} title={`Open WhatsApp chat with ${phone}`}>
      <MessageCircle size={14} /> {label}
    </button>
  );
}
