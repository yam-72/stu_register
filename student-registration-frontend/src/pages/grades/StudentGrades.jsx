import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiRefreshCw } from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import Loading from "../../components/Loading";

import { studentApi } from "../../api/studentApi";
import { gradeApi } from "../../api/gradeApi";

import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";

import { fullName, gpaRemark } from "../../utils/formatters";

export default function StudentGrades() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD STUDENT GRADE DATA
  // =========================================================

  async function loadGradeData() {
    if (!id) {
      setError("Student ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // -----------------------------------------
      // 1. Get student
      // -----------------------------------------

      const studentResponse = await studentApi.getOne(id);

      console.log("STUDENT RESPONSE:", studentResponse.data);

      const studentData = studentResponse?.data;

      /*
        Backend returns:

        {
          success: true,
          student: {
            student_id: 1,
            first_name: "...",
            last_name: "..."
          }
        }
      */

      const studentInfo =
        studentData?.student ||
        studentData?.data?.student ||
        studentData?.data ||
        null;

      if (!studentInfo) {
        throw new Error("Student data was not found.");
      }

      setStudent(studentInfo);

      // -----------------------------------------
      // 2. Get student grades
      // -----------------------------------------

      const gradesResponse = await gradeApi.getByStudent(id);

      console.log("GRADES RESPONSE:", gradesResponse.data);

      const gradesData = gradesResponse?.data;

      /*
        Backend returns:

        {
          success: true,
          student: {...},
          total_courses: 2,
          grades: [...]
        }
      */

      const gradeList =
        gradesData?.grades ||
        gradesData?.data?.grades ||
        gradesData?.data ||
        [];

      setGrades(Array.isArray(gradeList) ? gradeList : []);

      // -----------------------------------------
      // 3. Get GPA
      // -----------------------------------------

      const gpaResponse = await gradeApi.getGpa(id);

      console.log("GPA RESPONSE:", gpaResponse.data);

      const gpaData = gpaResponse?.data;

      /*
        Backend returns:

        {
          success: true,
          student: {...},
          total_courses: 2,
          total_credit_hours: 6,
          total_quality_points: 20,
          gpa: 3.33,
          courses: [...]
        }
      */

      const gpaInfo =
        gpaData?.data ||
        gpaData ||
        null;

      setGpa(gpaInfo);

    } catch (err) {
      console.error("STUDENT GRADE ERROR:", err);

      const message = extractErrorMessage(
        err,
        "Could not load student grade data."
      );

      setError(message);

      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  }

  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    loadGradeData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      key: "course_code",
      label: "Course Code",

      render: (row) => (
        <span className="font-mono text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded">
          {row.course_code || row.course?.course_code || "—"}
        </span>
      )
    },

    {
      key: "course_name",
      label: "Course Name",

      render: (row) =>
        row.course_name ||
        row.course?.course_name ||
        row.course?.name ||
        "—"
    },

    {
      key: "credit_hour",
      label: "Credit Hour",

      render: (row) =>
        row.credit_hour ??
        row.course?.credit_hour ??
        "—",

      hideOnMobile: true
    },

    {
      key: "semester",
      label: "Semester",

      render: (row) =>
        row.semester || "—",

      hideOnMobile: true
    },

    {
      key: "academic_year",
      label: "Academic Year",

      render: (row) =>
        row.academic_year || "—",

      hideOnMobile: true
    },

    {
      key: "grade",
      label: "Grade",

      render: (row) => (
        <span className="font-mono text-sm font-semibold text-navy-800 bg-navy-50 px-2.5 py-1 rounded">
          {row.grade || "—"}
        </span>
      )
    },

    {
      key: "remark",
      label: "Remark",

      render: (row) =>
        row.remark || "—",

      hideOnMobile: true
    }
  ];

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading grade report..." />
      </DashboardLayout>
    );
  }

  // =========================================================
  // GPA
  // =========================================================

  const gpaValue =
    gpa?.gpa ??
    gpa?.value ??
    0;

  const totalCreditHours =
    gpa?.total_credit_hours ??
    gpa?.credit_hours ??
    0;

  const totalQualityPoints =
    gpa?.total_quality_points ??
    gpa?.quality_points ??
    0;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <DashboardLayout>

      {/* BACK BUTTON */}

      <div className="flex items-center justify-between mb-5">

        <Link
          to="/grades"
          className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800"
        >
          <FiArrowLeft size={14} />
          Back to Student Search
        </Link>

        <button
          type="button"
          onClick={loadGradeData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 text-sm text-navy-600 hover:text-navy-800 disabled:opacity-50"
        >
          <FiRefreshCw
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <Card className="p-5 mb-5 border border-red-200">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="font-medium text-red-700">
                Could not load data
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={loadGradeData}
              className="shrink-0 px-4 py-2 rounded-lg bg-navy-700 text-white text-sm hover:bg-navy-800"
            >
              Try Again
            </button>

          </div>

        </Card>
      )}

      {/* CONTENT */}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* =====================================================
            STUDENT + GPA CARD
        ===================================================== */}

        <Card className="p-6 lg:col-span-1 h-fit">

          <p className="text-xs uppercase tracking-wide text-muted mb-1">
            Student
          </p>

          <h1 className="font-display text-lg text-navy-800 mb-1">
            {student
              ? fullName(student)
              : "Student"}
          </h1>

          <p className="font-mono text-xs text-navy-600 mb-6">
            {student?.registration_number || "—"}
          </p>

          {/* GPA */}

          <div className="flex flex-col items-center">

            <div className="relative h-36 w-36 flex items-center justify-center">

              <svg
                viewBox="0 0 120 120"
                className="h-36 w-36 -rotate-90"
              >

                {/* Background circle */}

                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#E3E7EF"
                  strokeWidth="10"
                />

                {/* GPA circle */}

                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#C89B3C"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    (Math.min(Number(gpaValue), 4) / 4) *
                    326.7
                  } 326.7`}
                />

              </svg>

              <div className="absolute text-center">

                <p className="text-[11px] text-muted uppercase tracking-wide">
                  Current GPA
                </p>

                <p className="font-mono text-3xl text-navy-800 mt-0.5">
                  {Number(gpaValue).toFixed(2)}
                </p>

                <p className="text-xs text-gold-600 font-medium mt-0.5">
                  {gpaRemark(gpaValue)}
                </p>

              </div>

            </div>

            {/* GPA STATISTICS */}

            <div className="grid grid-cols-2 gap-3 mt-5 w-full text-center">

              <div className="bg-paper rounded-lg py-3">

                <p className="font-mono text-base text-navy-800">
                  {totalCreditHours}
                </p>

                <p className="text-[11px] text-muted mt-1">
                  Total Credit Hours
                </p>

              </div>

              <div className="bg-paper rounded-lg py-3">

                <p className="font-mono text-base text-navy-800">
                  {Number(totalQualityPoints).toFixed(2)}
                </p>

                <p className="text-[11px] text-muted mt-1">
                  Quality Points
                </p>

              </div>

            </div>

          </div>

        </Card>

        {/* =====================================================
            GRADES TABLE
        ===================================================== */}

        <Card className="lg:col-span-2">

          <div className="flex items-center justify-between p-5 border-b border-line">

            <div>

              <p className="font-display text-base text-navy-800">
                Course Grades
              </p>

              <p className="text-xs text-muted mt-1">
                {grades.length} course
                {grades.length === 1 ? "" : "s"} graded
              </p>

            </div>

            <Link
              to="/grades/assign"
              className="flex items-center gap-1.5 text-xs font-medium bg-navy-700 text-white px-3 py-1.5 rounded-lg hover:bg-navy-800 transition"
            >
              <FiPlus size={13} />
              Assign Grade
            </Link>

          </div>

          <DataTable
            columns={columns}
            rows={grades}
            isLoading={false}
            error={error}
            emptyTitle="No grades available for this student."
            emptyDescription="Assign a grade for a registered course to see it here."
            emptyAction={{
              label: "Assign Grade",
              onClick: () => navigate("/grades/assign")
            }}
          />

        </Card>

      </div>

    </DashboardLayout>
  );
}