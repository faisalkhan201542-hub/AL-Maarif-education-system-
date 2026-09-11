import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

import StudentList from "./pages/Students/StudentList.jsx";
import StudentForm from "./pages/Students/StudentForm.jsx";
import StudentProfile from "./pages/Students/StudentProfile.jsx";
import StudentIDCard from "./pages/Students/StudentIDCard.jsx";
import StudentIdCardBulk from "./pages/Students/StudentIdCardBulk.jsx";

import ClassList from "./pages/Classes/ClassList.jsx";
import ClassDetail from "./pages/Classes/ClassDetail.jsx";

import TeacherList from "./pages/Teachers/TeacherList.jsx";
import TeacherForm from "./pages/Teachers/TeacherForm.jsx";
import PayrollList from "./pages/Teachers/PayrollList.jsx";

import AttendancePage from "./pages/Attendance/AttendancePage.jsx";

import FeeChallanList from "./pages/Fees/FeeChallanList.jsx";
import FeeChallanForm from "./pages/Fees/FeeChallanForm.jsx";
import FeeChallanPrint from "./pages/Fees/FeeChallanPrint.jsx";
import ExpenseList from "./pages/Expenses/ExpenseList.jsx";

import ExamList from "./pages/Exams/ExamList.jsx";
import ResultEntry from "./pages/Results/ResultEntry.jsx";
import ResultCard from "./pages/Results/ResultCard.jsx";

import SubjectList from "./pages/Subjects/SubjectList.jsx";
import TimetablePage from "./pages/Timetable/TimetablePage.jsx";
import TeacherTimetable from "./pages/Timetable/TeacherTimetable.jsx";

import AnnouncementList from "./pages/Announcements/AnnouncementList.jsx";
import CommunicationsHub from "./pages/Communications/CommunicationsHub.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import Accounting from "./pages/Reports/Accounting.jsx";

// Settings
import SchoolSettingsPage from "./pages/Settings/SchoolSettingsPage.jsx";
import SchoolLocation from "./pages/Location/SchoolLocation.jsx";

import PayChallan from "./pages/Public/PayChallan.jsx";
import PaymentSuccess from "./pages/Public/PaymentSuccess.jsx";
import PaymentCancel from "./pages/Public/PaymentCancel.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/pay/:id" element={<PayChallan />} />
        <Route path="/pay/success" element={<PaymentSuccess />} />
        <Route path="/pay/cancel" element={<PaymentCancel />} />

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
          <Route path="students/id-cards/bulk" element={<StudentIdCardBulk />} />
          <Route path="students/:id/id-card" element={<StudentIDCard />} />

          <Route path="classes" element={<ClassList />} />
          <Route path="classes/:name" element={<ClassDetail />} />

          <Route path="teachers" element={<TeacherList />} />
          <Route path="teachers/new" element={<TeacherForm />} />
          <Route path="teachers/:id/edit" element={<TeacherForm />} />
          <Route path="payroll" element={<PayrollList />} />

          <Route path="attendance" element={<AttendancePage />} />

          <Route path="fees" element={<FeeChallanList />} />
          <Route path="fees/new" element={<FeeChallanForm />} />
          <Route path="fees/:id/edit" element={<FeeChallanForm />} />
          <Route path="fees/:id/print" element={<FeeChallanPrint />} />
          <Route path="expenses" element={<ExpenseList />} />

          <Route path="exams" element={<ExamList />} />
          <Route path="exams/:examId/results" element={<ResultEntry />} />
          <Route path="results/:id" element={<ResultCard />} />

          <Route path="/subjects" element={<SubjectList />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/timetable/teacher" element={<TeacherTimetable />} />
        
        <Route path="/announcements" element={<AnnouncementList />} />
          <Route path="communications" element={<CommunicationsHub />} />
          <Route path="reports" element={<Reports />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="settings" element={<SchoolSettingsPage />} />
          <Route path="location" element={<SchoolLocation />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
