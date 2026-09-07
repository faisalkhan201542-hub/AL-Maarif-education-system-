import Subject from "../models/Subject.js";

// @route GET /api/subjects
export const getSubjects = async (req, res) => {
  const { class: className } = req.query;
  const query = {};
  if (className) query.class = className;
  const subjects = await Subject.find(query).sort({ class: 1, name: 1 });
  res.json(subjects);
};

// @route POST /api/subjects
export const createSubject = async (req, res) => {
  const { name, class: className, teacher } = req.body;
  if (!name || !className) {
    return res.status(400).json({ message: "Name and class are required" });
  }

  const subject = await Subject.create({
    name,
    class: className,
    teacher,
  });
  res.status(201).json(subject);
};

// @route PUT /api/subjects/:id
export const updateSubject = async (req, res) => {
  const { name, class: className, teacher } = req.body;
  const subject = await Subject.findById(req.params.id);

  if (!subject) return res.status(404).json({ message: "Subject not found" });

  if (name) subject.name = name;
  if (className) subject.class = className;
  if (teacher !== undefined) subject.teacher = teacher;

  await subject.save();
  res.json(subject);
};

// @route DELETE /api/subjects/:id
export const deleteSubject = async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ message: "Subject not found" });

  await subject.deleteOne();
  res.json({ message: "Subject removed" });
};
