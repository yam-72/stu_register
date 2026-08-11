import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ChangePassword from "./pages/auth/ChangePassword";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Students
import Students from "./pages/students/Students";
import StudentForm from "./pages/students/StudentForm";
import StudentDetails from "./pages/students/StudentDetails";

// Departments
import Departments from "./pages/departments/Departments";
import DepartmentForm from "./pages/departments/DepartmentForm";
import DepartmentDetails from "./pages/departments/DepartmentDetails";

// Courses
import Courses from "./pages/courses/Courses";
import CourseForm from "./pages/courses/CourseForm";
import CourseDetails from "./pages/courses/CourseDetails";

// Registrations
import Registrations from "./pages/registrations/Registrations";
import RegisterStudent from "./pages/registrations/RegisterStudent";
import StudentCourses from "./pages/registrations/StudentCourses";

// Grades
import Grades from "./pages/grades/Grades";
import AssignGrade from "./pages/grades/AssignGrade";
import StudentGrades from "./pages/grades/StudentGrades";

// Instructors
import Instructors from "./pages/instructors/Instructors";
import InstructorForm from "./pages/instructors/InstructorForm";
import InstructorDetails from "./pages/instructors/InstructorDetails";

import NotFound from "./pages/NotFound";

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public / auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected application routes */}
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

          <Route path="/students" element={<Protected><Students /></Protected>} />
          <Route path="/students/create" element={<Protected><StudentForm /></Protected>} />
          <Route path="/students/:id" element={<Protected><StudentDetails /></Protected>} />
          <Route path="/students/:id/edit" element={<Protected><StudentForm /></Protected>} />

          <Route path="/departments" element={<Protected><Departments /></Protected>} />
          <Route path="/departments/create" element={<Protected><DepartmentForm /></Protected>} />
          <Route path="/departments/:id" element={<Protected><DepartmentDetails /></Protected>} />
          <Route path="/departments/:id/edit" element={<Protected><DepartmentForm /></Protected>} />

          <Route path="/courses" element={<Protected><Courses /></Protected>} />
          <Route path="/courses/create" element={<Protected><CourseForm /></Protected>} />
          <Route path="/courses/:id" element={<Protected><CourseDetails /></Protected>} />
          <Route path="/courses/:id/edit" element={<Protected><CourseForm /></Protected>} />

          <Route path="/registrations" element={<Protected><Registrations /></Protected>} />
          <Route path="/registrations/create" element={<Protected><RegisterStudent /></Protected>} />
          <Route path="/registrations/student/:id" element={<Protected><StudentCourses /></Protected>} />

          <Route path="/grades" element={<Protected><Grades /></Protected>} />
          <Route path="/grades/assign" element={<Protected><AssignGrade /></Protected>} />
          <Route path="/grades/student/:id" element={<Protected><StudentGrades /></Protected>} />

          <Route path="/instructors" element={<Protected><Instructors /></Protected>} />
          <Route path="/instructors/create" element={<Protected><InstructorForm /></Protected>} />
          <Route path="/instructors/:id" element={<Protected><InstructorDetails /></Protected>} />
          <Route path="/instructors/:id/edit" element={<Protected><InstructorForm /></Protected>} />

          <Route path="/change-password" element={<Protected><ChangePassword /></Protected>} />

          {/* Root + fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
