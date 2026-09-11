import { getStatus, startConnection, logout, sendMessage } from '../services/whatsappService.js';

export const getWhatsappStatus = (req, res) => {
  res.json(getStatus());
};

export const startWhatsapp = (req, res) => {
  startConnection();
  res.json({ message: "WhatsApp connection started" });
};

export const logoutWhatsapp = async (req, res) => {
  try {
    await logout();
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to logout", error: error.message });
  }
};

export const sendWhatsappMessage = async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ message: "Phone and message are required" });
  }
  try {
    await sendMessage(phone, message);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};
