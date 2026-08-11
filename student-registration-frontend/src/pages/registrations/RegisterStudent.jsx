
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";

import { registrationApi } from "../../api/registrationApi";
import { studentApi } from "../../api/studentApi";
import { courseApi } from "../../api/courseApi";

import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";

import {
  validateFields,
  isRequired
} from "../../utils/validators";

import { fullName } from "../../utils/formatters";

const SEMESTER_OPTIONS = [
  {
    value: "Semester I",
    label: "Semester I"
  },
  {
    value: "Semester II",
    label: "Semester II"
  },
  {
    value: "Summer",
    label: "Summer"
  }
];

const initialValues = {
  student_id: "",
  course_id: "",
  semester: "",
  academic_year: ""
};

export default function RegistrationStudent() {
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function loadStudents() {
      setLoadingStudents(true);

      try {
        const response = await studentApi.getAll();

        if (!mounted) return;

        console.log(
          "REGISTRATION STUDENTS RESPONSE:",
          response.data
        );

        const data = response?.data;

        let list = [];

        if (Array.isArray(data?.students)) {
          list = data.students;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data)) {
          list = data;
        }

        setStudents(list);
      } catch (error) {
        if (!mounted) return;

        console.error(
          "LOAD REGISTRATION STUDENTS ERROR:",
          error
        );

        setStudents([]);

        toast.error(
          extractErrorMessage(
            error,
            "Unable to load students."
          )
        );
      } finally {
        if (mounted) {
          setLoadingStudents(false);
        }
      }
    }

    loadStudents();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // =========================================================
  // LOAD COURSES
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      setLoadingCourses(true);

      try {
        const response = await courseApi.getAll();

        if (!mounted) return;

        console.log(
          "REGISTRATION COURSES RESPONSE:",
          response.data
        );

        const data = response?.data;

        let list = [];

        if (Array.isArray(data?.courses)) {
          list = data.courses;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data)) {
          list = data;
        }

        setCourses(list);
      } catch (error) {
        if (!mounted) return;

        console.error(
          "LOAD REGISTRATION COURSES ERROR:",
          error
        );

        setCourses([]);

        toast.error(
          extractErrorMessage(
            error,
            "Unable to load courses."
          )
        );
      } finally {
        if (mounted) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // =========================================================
  // STUDENT OPTIONS
  // =========================================================

  const studentOptions = students
    .map((student) => {
      /*
        IMPORTANT:
        Backend uses student_id.
      */

      const id = student?.student_id;

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
    })
    .filter(Boolean);

  // =========================================================
  // COURSE OPTIONS
  // =========================================================

  const courseOptions = courses
    .map((course) => {
      /*
        Backend uses course_id.
      */

      const id = course?.course_id;

      if (!id) {
        return null;
      }

      const code =
        course?.course_code ||
        "";

      const name =
        course?.course_name ||
        "";

      let label = "";

      if (code && name) {
        label = `${code} — ${name}`;
      } else if (code) {
        label = code;
      } else if (name) {
        label = name;
      } else {
        label = `Course ${id}`;
      }

      return {
        value: String(id),
        label
      };
    })
    .filter(Boolean);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    const fieldErrors = validateFields(values, {
      student_id: [isRequired],
      course_id: [isRequired],
      semester: [isRequired],
      academic_year: [isRequired]
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);

      toast.error(
        "Please complete all required fields."
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        student_id: Number(values.student_id),
        course_id: Number(values.course_id),
        semester: values.semester,
        academic_year: values.academic_year
      };

      console.log(
        "REGISTRATION PAYLOAD:",
        payload
      );

      await registrationApi.create(payload);

      toast.success(
        "Student registered for the course successfully."
      );

      navigate(
        `/registrations/student/${values.student_id}`
      );
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      toast.error(
        extractErrorMessage(
          error,
          "Unable to register this course."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <DashboardLayout>

      <div className="max-w-lg mx-auto">

        {/* HEADER */}

        <div className="flex items-center gap-2 mb-6">

          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiEdit3 size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            Register Student
          </h1>

        </div>

        {/* FORM CARD */}

        <Card className="p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >

            {/* STUDENT */}

            <FormField
              as="select"
              label="Select Student"
              name="student_id"
              value={values.student_id}
              onChange={handleChange}
              error={errors.student_id}
              required
              options={studentOptions}
              placeholder={
                loadingStudents
                  ? "Loading students..."
                  : studentOptions.length === 0
                  ? "No students available"
                  : "Select a student"
              }
            />

            {/* COURSE */}

            <FormField
              as="select"
              label="Select Course"
              name="course_id"
              value={values.course_id}
              onChange={handleChange}
              error={errors.course_id}
              required
              options={courseOptions}
              placeholder={
                loadingCourses
                  ? "Loading courses..."
                  : courseOptions.length === 0
                  ? "No courses available"
                  : "Select a course"
              }
            />

            {/* SEMESTER + ACADEMIC YEAR */}

            <div className="grid sm:grid-cols-2 gap-4">

              <FormField
                as="select"
                label="Semester"
                name="semester"
                value={values.semester}
                onChange={handleChange}
                error={errors.semester}
                required
                options={SEMESTER_OPTIONS}
                placeholder="Select semester"
              />

              <FormField
                label="Academic Year"
                name="academic_year"
                value={values.academic_year}
                onChange={handleChange}
                error={errors.academic_year}
                required
                placeholder="e.g. 2025/2026"
              />

            </div>

            {/* BUTTONS */}

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => navigate("/registrations")}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm border border-line text-ink hover:bg-paper transition disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  loadingStudents ||
                  loadingCourses ||
                  !values.student_id ||
                  !values.course_id
                }
                className="flex-1 py-2.5 rounded-lg text-sm bg-navy-700 text-white hover:bg-navy-800 transition disabled:opacity-60"
              >
                {isSubmitting
                  ? "Registering..."
                  : "Register Course"}
              </button>

            </div>

          </form>

        </Card>

      </div>

    </DashboardLayout>
  );
}

