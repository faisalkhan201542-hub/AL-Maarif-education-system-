export const fmtDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtMoney = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

export const statusBadgeClass = (status) => {
  const map = {
    Present: "badge-green",
    Paid: "badge-green",
    Verified: "badge-green",
    Active: "badge-green",
    Absent: "badge-red",
    Unpaid: "badge-red",
    Rejected: "badge-red",
    Fail: "badge-red",
    Leave: "badge-yellow",
    Partial: "badge-yellow",
    Pending: "badge-yellow",
    Pass: "badge-green",
  };
  return map[status] || "badge-gray";
};

export const cleanPhone = (raw) => {
  if (!raw) return "";
  let digits = String(raw).replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = "92" + digits.slice(1);
  return digits;
};

export const buildWhatsappLink = (phone, message = "") => {
  const clean = cleanPhone(phone);
  return `https://wa.me/${clean}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
};
