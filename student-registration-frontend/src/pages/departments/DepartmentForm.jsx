
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiBriefcase } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";
import Loading from "../../components/Loading";
import { departmentApi } from "../../api/departmentApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { validateFields, isRequired } from "../../utils/validators";

const initialValues = {
  department_name: "",
  department_code: ""
};

export default function DepartmentForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    departmentApi
      .getOne(id)
      .then(({ data }) => {
        const dept = data?.department || data?.data || data;

        setValues({
          department_name: dept.department_name || "",
          department_code: dept.department_code || ""
        });
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Unable to load this department.")
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
      department_name: [isRequired],
      department_code: [isRequired]
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await departmentApi.update(id, values);
        toast.success("Department updated successfully");
      } else {
        await departmentApi.create(values);
        toast.success("Department created successfully");
      }

      navigate("/departments");
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          "Unable to save this department."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading department..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiBriefcase size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            {isEditMode ? "Edit Department" : "Add Department"}
          </h1>
        </div>

        <Card className="p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >

            <FormField
              label="Department Name"
              name="department_name"
              value={values.department_name}
              onChange={handleChange}
              error={errors.department_name}
              required
              placeholder="e.g. Computer Engineering"
            />

            <FormField
              label="Department Code"
              name="department_code"
              value={values.department_code}
              onChange={handleChange}
              error={errors.department_code}
              required
              placeholder="e.g. CENG"
            />

            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() => navigate("/departments")}
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
                  : "Create Department"}
              </button>

            </div>

          </form>

        </Card>
      </div>
    </DashboardLayout>
  );
}
