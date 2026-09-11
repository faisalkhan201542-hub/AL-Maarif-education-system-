// Cleans a phone number into digits-only (with country code) format for wa.me links.
export const cleanPhoneForWhatsapp = (raw) => {
  if (!raw) return "";
  let digits = String(raw).replace(/[^\d]/g, "");
  // If number starts with a local Pakistani 0 (e.g. 03139163732), convert to 92 prefix
  if (digits.startsWith("0")) {
    digits = "92" + digits.slice(1);
  }
  return digits;
};

export const buildWhatsappLink = (rawPhone, message = "") => {
  const phone = cleanPhoneForWhatsapp(rawPhone);
  if (!phone) return null;
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}${text ? `?text=${text}` : ""}`;
};
