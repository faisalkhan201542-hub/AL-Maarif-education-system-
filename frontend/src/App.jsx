import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

import StudentList from "./pages/Students/StudentList.jsx";
import StudentForm from "./pages/Students/StudentForm.jsx";
import StudentProfile from "./pages/Students/StudentProfile.jsx";
import StudentIDCard from "./pages/Students/StudentIDCard.jsx";

import ClassList from "./pages/Classes/ClassList.jsx";
import ClassDetail from "./pages/Classes/ClassDetail.jsx";

import TeacherList from "./pages/Teachers/TeacherList.jsx";
import TeacherForm from "./pages/Teachers/TeacherForm.jsx";

import AttendancePage from "./pages/Attendance/AttendancePage.jsx";

import FeeChallanList from "./pages/Fees/FeeChallanList.jsx";
import FeeChallanForm from "./pages/Fees/FeeChallanForm.jsx";
import FeeChallanPrint from "./pages/Fees/FeeChallanPrint.jsx";

import ExamList from "./pages/Exams/ExamList.jsx";
import ResultEntry from "./pages/Results/ResultEntry.jsx";
import ResultCard from "./pages/Results/ResultCard.jsx";

import SubjectList from "./pages/Subjects/SubjectList.jsx";
import TimetablePage from "./pages/Timetable/TimetablePage.jsx";

import AnnouncementList from "./pages/Announcements/AnnouncementList.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import SchoolSettingsPage from "./pages/Settings/SchoolSettingsPage.jsx";
import SchoolLocation from "./pages/Location/SchoolLocation.jsx";
import CertificatePage from "./pages/Certificate/CertificatePage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="students" element={<StudentList />} />
        <Route path="students/new" element={<StudentForm />} />
        <Route path="students/:id/edit" element={<StudentForm />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="students/:id/id-card" element={<StudentIDCard />} />

        <Route path="classes" element={<ClassList />} />
        <Route path="classes/:name" element={<ClassDetail />} />

        <Route path="teachers" element={<TeacherList />} />
        <Route path="teachers/new" element={<TeacherForm />} />
        <Route path="teachers/:id/edit" element={<TeacherForm />} />

        <Route path="attendance" element={<AttendancePage />} />

        <Route path="fees" element={<FeeChallanList />} />
        <Route path="fees/new" element={<FeeChallanForm />} />
        <Route path="fees/:id/edit" element={<FeeChallanForm />} />
        <Route path="fees/:id/print" element={<FeeChallanPrint />} />

        <Route path="exams" element={<ExamList />} />
        <Route path="exams/:examId/results" element={<ResultEntry />} />
        <Route path="results/:id" element={<ResultCard />} />

        <Route path="subjects" element={<SubjectList />} />
        <Route path="timetable" element={<TimetablePage />} />

        <Route path="announcements" element={<AnnouncementList />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SchoolSettingsPage />} />
        <Route path="location" element={<SchoolLocation />} />
        <Route path="certificate" element={<CertificatePage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
