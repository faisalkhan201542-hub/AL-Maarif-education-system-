import multer from "multer";
import path from "path";
import fs from "fs";

const makeStorage = (subfolder) => {
  const dir = path.join(process.cwd(), "uploads", subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error("Only image files are allowed (jpg, jpeg, png, webp, gif)"));
};

export const uploadStudentPhoto = multer({
  storage: makeStorage("students"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadTeacherPhoto = multer({
  storage: makeStorage("teachers"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadLogo = multer({
  storage: makeStorage("logo"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
