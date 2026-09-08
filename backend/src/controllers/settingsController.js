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

  if (req.body.feeStructure) {
    try {
      settings.feeStructure = JSON.parse(req.body.feeStructure);
      settings.markModified("feeStructure");
    } catch (e) {
      console.error("Invalid feeStructure format");
    }
  }

  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      settings.logoUrl = `/uploads/logo/${req.files.logo[0].filename}`;
    }
    if (req.files.qrCode && req.files.qrCode[0]) {
      settings.qrCodeUrl = `/uploads/logo/${req.files.qrCode[0].filename}`;
    }
  }

  await settings.save();
  res.json(settings);
};
