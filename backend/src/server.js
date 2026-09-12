import express from "express";
import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, 
      "https://al-maarif-education-system.vercel.app", 
      "http://localhost:5173"
    ].filter(Boolean),
    credentials: true,
  })
);

// Webhook route MUST be before express.json()
app.use("/api/webhooks", webhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Static uploads (student/teacher photos, school logo)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", school: "Al-Maarif Education" }));

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/public/fees", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
import { startConnection } from "./services/whatsappService.js";

app.listen(PORT, () => {
  console.log(`Al-Maarif Education API running on port ${PORT}`);
  startConnection();
});
