import Student from "../models/Student.js";

// @desc Fetch all active students contacts for a specific class for bulk messaging
// @route GET /api/communications/class-contacts
export const getClassContacts = async (req, res) => {
  const { class: className } = req.query;
  
  if (!className) {
    return res.status(400).json({ message: "Class is required" });
  }

  const students = await Student.find({ class: className, status: "Active" })
    .select("name fatherName fatherWhatsapp registrationNumber")
    .sort({ rollNumber: 1 });

  res.json(students);
};
