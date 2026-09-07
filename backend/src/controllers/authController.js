import Principal from "../models/Principal.js";
import generateToken from "../utils/generateToken.js";

// @desc Login principal
// @route POST /api/auth/login
export const loginPrincipal = async (req, res) => {
  const { whatsapp, password } = req.body;

  if (!whatsapp || !password) {
    return res.status(400).json({ message: "WhatsApp number and password are required" });
  }

  const principal = await Principal.findOne({ whatsapp });

  if (principal && (await principal.matchPassword(password))) {
    return res.json({
      _id: principal._id,
      name: principal.name,
      whatsapp: principal.whatsapp,
      token: generateToken(principal._id),
    });
  }

  return res.status(401).json({ message: "Invalid WhatsApp number or password" });
};

// @desc Get logged-in principal profile
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.principal);
};

// @desc Update principal password
// @route PUT /api/auth/password
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const principal = await Principal.findById(req.principal._id);

  if (!principal || !(await principal.matchPassword(currentPassword))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  principal.password = newPassword;
  await principal.save();
  res.json({ message: "Password updated successfully" });
};
