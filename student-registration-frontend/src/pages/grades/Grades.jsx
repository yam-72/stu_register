import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPieChart, FiArrowRight } from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";

import { studentApi } from "../../api/studentApi";
import { useLookupOptions } from "../../hooks/useLookupOptions";
import { fullName } from "../../utils/formatters";

export default function Grades() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");

  const {
    options: studentOptions,
    isLoading,
    error
  } = useLookupOptions(
    studentApi.getAll,

    // IMPORTANT:
    // Backend uses student_id, NOT id
    (student) => {
      if (!student?.student_id) {
        return null;
      }

      return {
        value: String(student.student_id),

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

    console.log("Selected student ID:", studentId);

    navigate(`/grades/student/${studentId}`);
  }

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}

      <div className="flex items-center gap-2 mb-6">

        <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
          <FiPieChart size={16} />
        </div>

        <h1 className="font-display text-xl text-navy-800">
          Student Grades
        </h1>

      </div>

      {/* CARD */}

      <Card className="p-6 max-w-lg">

        <p className="text-sm text-muted mb-4">
          Select a student to view their recorded grades and current GPA.
        </p>

        <form
          onSubmit={handleView}
          className="flex flex-col sm:flex-row gap-3"
        >

          <div className="flex-1">

            <FormField
              as="select"
              label="Student"
              name="student_id"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
              }}
              options={studentOptions}
              placeholder={
                isLoading
                  ? "Loading students..."
                  : studentOptions.length === 0
                  ? "No students found"
                  : "Select a student"
              }
            />

            {error && (
              <p className="text-sm text-red-600 mt-2">
                {error}
              </p>
            )}

          </div>

          <button
            type="submit"
            disabled={!studentId || isLoading}
            className="flex items-center justify-center gap-2 bg-navy-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition disabled:opacity-50 shrink-0"
          >
            View Grades

            <FiArrowRight size={15} />

          </button>

        </form>

      </Card>

    </DashboardLayout>
  );
}