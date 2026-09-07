import Announcement from "../models/Announcement.js";

export const getAnnouncements = async (req, res) => {
  const announcements = await Announcement.find().sort({ date: -1 });
  res.json(announcements);
};

export const createAnnouncement = async (req, res) => {
  const { title, description, type, date, priority } = req.body;
  if (!title || !description) return res.status(400).json({ message: "title and description are required" });
  const announcement = await Announcement.create({ title, description, type, date, priority });
  res.status(201).json(announcement);
};

export const updateAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ message: "Announcement not found" });
  ["title", "description", "type", "date", "priority", "status"].forEach((f) => {
    if (req.body[f] !== undefined) announcement[f] = req.body[f];
  });
  await announcement.save();
  res.json(announcement);
};

export const deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).json({ message: "Announcement not found" });
  await announcement.deleteOne();
  res.json({ message: "Announcement deleted successfully" });
};
