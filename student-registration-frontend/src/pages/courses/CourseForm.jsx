
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";
import Loading from "../../components/Loading";
import { courseApi } from "../../api/courseApi";
import { departmentApi } from "../../api/departmentApi";
import { useLookupOptions } from "../../hooks/useLookupOptions";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import {
  validateFields,
  isRequired,
  isInRange
} from "../../utils/validators";

const initialValues = {
  course_code: "",
  course_name: "",
  credit_hour: "",
  department_id: ""
};

export default function CourseForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { options: departmentOptions } = useLookupOptions(
    departmentApi.getAll,
    (d) => ({
      value: d.department_id,
      label: `${d.department_code || ""} - ${d.department_name || ""}`
    })
  );

  useEffect(() => {
    if (!isEditMode) return;

    courseApi
      .getOne(id)
      .then(({ data }) => {
        const c = data?.course || data?.data || data;

        setValues({
          course_code: c.course_code || "",
          course_name: c.course_name || "",
          credit_hour: c.credit_hour ?? "",
          department_id: c.department_id || ""
        });
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(
            err,
            "Unable to load this course."
          )
        )
      )
      .finally(() => setIsLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validateFields(values, {
      course_code: [isRequired],
      course_name: [isRequired],
      credit_hour: [
        isRequired,
        isInRange(1, 12)
      ],
      department_id: [isRequired]
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await courseApi.update(id, values);
        toast.success("Course updated successfully");
      } else {
        await courseApi.create(values);
        toast.success("Course created successfully");
      }

      navigate("/courses");
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          "Course already exists or could not be saved."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading course..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-2 mb-6">

          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiBookOpen size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            {isEditMode ? "Edit Course" : "Add Course"}
          </h1>

        </div>

        <Card className="p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >

            <FormField
              label="Course Code"
              name="course_code"
              value={values.course_code}
              onChange={handleChange}
              error={errors.course_code}
              required
              placeholder="e.g. CENG-3101"
            />

            <FormField
              label="Course Name"
              name="course_name"
              value={values.course_name}
              onChange={handleChange}
              error={errors.course_name}
              required
              placeholder="e.g. Data Structures and Algorithms"
            />

            <FormField
              label="Credit Hour"
              name="credit_hour"
              type="number"
              value={values.credit_hour}
              onChange={handleChange}
              error={errors.credit_hour}
              required
              placeholder="e.g. 3"
            />

            <FormField
              as="select"
              label="Department"
              name="department_id"
              value={values.department_id}
              onChange={handleChange}
              error={errors.department_id}
              required
              options={departmentOptions}
              placeholder="Select department"
            />

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="flex-1 py-2.5 rounded-lg text-sm border border-line text-ink hover:bg-paper transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm bg-navy-700 text-white hover:bg-navy-800 transition disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Create Course"}
              </button>

            </div>

          </form>

        </Card>
      </div>
    </DashboardLayout>
  );
}

