import Teacher from "../models/Teacher.js";

const generateTeacherId = async () => {
  const count = await Teacher.countDocuments();
  return `AME-TCH-${String(count + 1).padStart(3, "0")}`;
};

// @route GET /api/teachers
export const getTeachers = async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: new RegExp(search, "i") },
      { teacherId: new RegExp(search, "i") },
      { subject: new RegExp(search, "i") },
    ];
  }
  const teachers = await Teacher.find(query).sort({ createdAt: -1 });
  res.json(teachers);
};

// @route GET /api/teachers/:id
export const getTeacherById = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });
  res.json(teacher);
};

// @route POST /api/teachers
export const createTeacher = async (req, res) => {
  const { name, phone, whatsapp, qualification, subject, joiningDate, assignedClass, status } = req.body;
  if (!name || !phone || !whatsapp) {
    return res.status(400).json({ message: "Name, phone and WhatsApp are required" });
  }
  const teacherId = await generateTeacherId();
  const photoUrl = req.body.photoBase64 || (req.file ? `/uploads/teachers/${req.file.filename}` : "");

  const teacher = await Teacher.create({
    teacherId,
    name,
    phone,
    whatsapp,
    qualification,
    subject,
    joiningDate,
    assignedClass,
    status: status || "Active",
    photoUrl,
  });
  res.status(201).json(teacher);
};

// @route PUT /api/teachers/:id
export const updateTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const fields = ["name", "phone", "whatsapp", "qualification", "subject", "joiningDate", "assignedClass", "status"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) teacher[f] = req.body[f];
  });
  if (req.body.photoBase64) {
    teacher.photoUrl = req.body.photoBase64;
  } else if (req.file) {
    teacher.photoUrl = `/uploads/teachers/${req.file.filename}`;
  }

  await teacher.save();
  res.json(teacher);
};

// @route DELETE /api/teachers/:id
export const deleteTeacher = async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });
  await teacher.deleteOne();
  res.json({ message: "Teacher deleted successfully" });
};
