
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClipboard,
  FiArrowRight
} from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";

import { studentApi } from "../../api/studentApi";
import { useLookupOptions } from "../../hooks/useLookupOptions";
import { fullName } from "../../utils/formatters";

export default function Registrations() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");

  const {
    options: studentOptions,
    isLoading,
    error
  } = useLookupOptions(
    studentApi.getAll,

    // IMPORTANT:
    // Backend returns student_id, NOT id
    (student) => {
      const id =
        student.student_id ??
        student.id;

      if (!id) {
        return null;
      }

      return {
        value: String(id),
        label: `${fullName(student)}${
          student.registration_number
            ? ` — ${student.registration_number}`
            : ""
        }`
      };
    }
  );

  function handleView(e) {
    e.preventDefault();

    if (!studentId) {
      return;
    }

    navigate(`/registrations/student/${studentId}`);
  }

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}

      <div className="flex items-center gap-2 mb-6">

        <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
          <FiClipboard size={16} />
        </div>

        <h1 className="font-display text-xl text-navy-800">
          Student Courses
        </h1>

      </div>


      {/* CONTENT CARD */}

      <Card className="p-6 max-w-lg">

        <p className="text-sm text-muted mb-4">
          Select a student to view their registered courses, or register a new
          enrollment from the sidebar.
        </p>


        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        <form
          onSubmit={handleView}
          className="flex flex-col sm:flex-row gap-3"
        >

          <div className="flex-1">

            <FormField
              as="select"
              name="student_id"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={studentOptions}
              placeholder={
                isLoading
                  ? "Loading students..."
                  : studentOptions.length === 0
                  ? "No students available"
                  : "Select a student"
              }
            />

          </div>


          <button
            type="submit"
            disabled={!studentId || isLoading}
            className="flex items-center justify-center gap-2 bg-navy-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition disabled:opacity-50 shrink-0"
          >
            View Courses

            <FiArrowRight size={15} />

          </button>

        </form>

      </Card>

    </DashboardLayout>
  );
}
