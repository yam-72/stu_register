
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward } from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";

import { gradeApi } from "../../api/gradeApi";
import { studentApi } from "../../api/studentApi";
import { registrationApi } from "../../api/registrationApi";

import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";

import {
  validateFields,
  isRequired
} from "../../utils/validators";

import { fullName } from "../../utils/formatters";

const GRADE_OPTIONS = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
  "F"
].map((grade) => ({
  value: grade,
  label: grade
}));

const initialValues = {
  student_id: "",
  student_course_id: "",
  grade: "",
  remark: ""
};

export default function AssignGrade() {
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const [students, setStudents] = useState([]);
  const [registrationOptions, setRegistrationOptions] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

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

        console.log("STUDENTS RESPONSE:", response.data);

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

        console.error("LOAD STUDENTS ERROR:", error);

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
  // STUDENT OPTIONS
  // =========================================================

  const studentOptions = students
    .map((student) => {
      // IMPORTANT:
      // Backend uses student_id, NOT id.
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
  // LOAD REGISTERED COURSES WHEN STUDENT CHANGES
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function loadRegistrations() {
      if (!values.student_id) {
        setRegistrationOptions([]);
        return;
      }

      setLoadingRegistrations(true);
      setRegistrationOptions([]);

      try {
        console.log(
          "Loading registrations for student:",
          values.student_id
        );

        const response = await registrationApi.getByStudent(
          values.student_id
        );

        if (!mounted) return;

        console.log(
          "REGISTRATION RESPONSE:",
          response.data
        );

        const data = response?.data;

        let list = [];

        /*
          Support your backend response formats.

          Example:

          {
            success: true,
            student: {...},
            total_courses: 2,
            courses: [...]
          }
        */

        if (Array.isArray(data?.courses)) {
          list = data.courses;
        } else if (Array.isArray(data?.registrations)) {
          list = data.registrations;
        } else if (Array.isArray(data?.data)) {
          list = data.data;
        } else if (Array.isArray(data?.items)) {
          list = data.items;
        } else if (Array.isArray(data)) {
          list = data;
        }

        const options = list
          .map((registration) => {
            /*
              Your student_courses table uses:

              id
              student_id
              course_id
              semester
              academic_year

              We need the `id` because grades.student_course_id
              references student_courses.id.
            */

            const registrationId =
              registration?.id ??
              registration?.student_course_id ??
              registration?.registration_id;

            if (!registrationId) {
              return null;
            }

            const courseCode =
              registration?.course_code ??
              registration?.course?.course_code ??
              registration?.course?.code ??
              "";

            const courseName =
              registration?.course_name ??
              registration?.course?.course_name ??
              registration?.course?.name ??
              "";

            const semester =
              registration?.semester ?? "";

            const academicYear =
              registration?.academic_year ?? "";

            let label = "";

            if (courseCode && courseName) {
              label = `${courseCode} — ${courseName}`;
            } else if (courseCode) {
              label = courseCode;
            } else if (courseName) {
              label = courseName;
            } else {
              label = `Course ${registrationId}`;
            }

            if (semester || academicYear) {
              label += ` (${semester}${
                semester && academicYear ? ", " : ""
              }${academicYear})`;
            }

            return {
              value: String(registrationId),
              label
            };
          })
          .filter(Boolean);

        setRegistrationOptions(options);
      } catch (error) {
        if (!mounted) return;

        console.error(
          "LOAD REGISTRATIONS ERROR:",
          error
        );

        setRegistrationOptions([]);

        toast.error(
          extractErrorMessage(
            error,
            "Unable to load registered courses."
          )
        );
      } finally {
        if (mounted) {
          setLoadingRegistrations(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      mounted = false;
    };
  }, [values.student_id, toast]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,

      // When changing student, clear selected course.
      ...(name === "student_id"
        ? {
            student_course_id: ""
          }
        : {})
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));

    if (name === "student_id") {
      setErrors((previous) => ({
        ...previous,
        student_course_id: ""
      }));
    }
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    const fieldErrors = validateFields(values, {
      student_id: [isRequired],
      student_course_id: [isRequired],
      grade: [isRequired]
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
      /*
        IMPORTANT:

        Backend expects:

        {
          student_course_id,
          grade,
          remark
        }
      */

      const payload = {
        student_course_id: Number(
          values.student_course_id
        ),
        grade: values.grade,
        remark: values.remark || null
      };

      console.log(
        "ASSIGN GRADE PAYLOAD:",
        payload
      );

      await gradeApi.assign(payload);

      toast.success(
        "Grade assigned successfully."
      );

      navigate(
        `/grades/student/${values.student_id}`
      );
    } catch (error) {
      console.error(
        "ASSIGN GRADE ERROR:",
        error
      );

      toast.error(
        extractErrorMessage(
          error,
          "Unable to assign this grade."
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
            <FiAward size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            Assign Grade
          </h1>

        </div>

        {/* FORM */}

        <Card className="p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >

            {/* STUDENT */}

            <FormField
              as="select"
              label="Student"
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
                  ? "No students found"
                  : "Select a student"
              }
            />

            {/* REGISTERED COURSE */}

            <FormField
              as="select"
              label="Course Registration"
              name="student_course_id"
              value={values.student_course_id}
              onChange={handleChange}
              error={errors.student_course_id}
              required
              disabled={
                !values.student_id ||
                loadingRegistrations
              }
              options={registrationOptions}
              placeholder={
                !values.student_id
                  ? "Select a student first"
                  : loadingRegistrations
                  ? "Loading registered courses..."
                  : registrationOptions.length === 0
                  ? "No registered courses found"
                  : "Select a course"
              }
            />

            {/* GRADE */}

            <FormField
              as="select"
              label="Grade"
              name="grade"
              value={values.grade}
              onChange={handleChange}
              error={errors.grade}
              required
              options={GRADE_OPTIONS}
              placeholder="Select grade"
            />

            {/* REMARK */}

            <FormField
              as="textarea"
              label="Remark"
              name="remark"
              value={values.remark}
              onChange={handleChange}
              error={errors.remark}
              placeholder="Optional note about this grade"
            />

            {/* BUTTON */}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                loadingStudents ||
                loadingRegistrations ||
                !values.student_id ||
                !values.student_course_id
              }
              className="w-full py-2.5 rounded-lg text-sm bg-navy-700 text-white hover:bg-navy-800 transition disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : "Assign Grade"}
            </button>

          </form>

        </Card>

      </div>

    </DashboardLayout>
  );
}

