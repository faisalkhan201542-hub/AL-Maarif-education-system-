import SchoolSettings from "../models/SchoolSettings.js";

// @route GET /api/settings
export const getSettings = async (req, res) => {
  const settings = await SchoolSettings.getSettings();
  res.json(settings);
};

// @route PUT /api/settings
export const updateSettings = async (req, res) => {
  const settings = await SchoolSettings.getSettings();

  const fields = [
    "schoolName",
    "address",
    "principalName",
    "principalWhatsapp",
    "schoolPhone",
    "schoolEmail",
    "googleMapsLink",
    "academicYear",
    "paymentMethod",
    "easypaisaNumber",
    "easypaisaAccountName",
    "paymentInstructions",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) settings[f] = req.body[f];
  });

  if (req.file) {
    settings.logoUrl = `/uploads/logo/${req.file.filename}`;
  }

  await settings.save();
  res.json(settings);
};
