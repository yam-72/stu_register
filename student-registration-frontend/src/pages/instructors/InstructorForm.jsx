
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";
import Loading from "../../components/Loading";

import { instructorApi } from "../../api/instructorApi";
import { departmentApi } from "../../api/departmentApi";

import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";

import {
  validateFields,
  isRequired,
  isEmail,
  isPhone
} from "../../utils/validators";

const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department_id: ""
};

export default function InstructorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const isEditMode = Boolean(id);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [isLoadingInstructor, setIsLoadingInstructor] =
    useState(isEditMode);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDepartments() {
      try {
        setLoadingDepartments(true);

        const response = await departmentApi.getAll();

        console.log(
          "Department API response:",
          response.data
        );

        if (!mounted) return;

        const data = response?.data;

        const list = Array.isArray(data?.departments)
          ? data.departments
          : [];

        const formattedDepartments = list
          .filter(
            (department) =>
              department &&
              department.department_id
          )
          .map((department) => ({
            value: String(department.department_id),
            label: `${department.department_code} — ${department.department_name}`
          }));

        console.log(
          "Department dropdown options:",
          formattedDepartments
        );

        setDepartments(formattedDepartments);

      } catch (error) {
        console.error(
          "Failed to load departments:",
          error
        );

        if (!mounted) return;

        setDepartments([]);

        toast.error(
          extractErrorMessage(
            error,
            "Unable to load departments."
          )
        );
      } finally {
        if (mounted) {
          setLoadingDepartments(false);
        }
      }
    }

    loadDepartments();

    return () => {
      mounted = false;
    };

    // We intentionally load departments once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ============================================================
   * LOAD INSTRUCTOR WHEN EDITING
   * ============================================================
   */
  useEffect(() => {
    if (!isEditMode) {
      setIsLoadingInstructor(false);
      return;
    }

    let mounted = true;

    async function loadInstructor() {
      try {
        setIsLoadingInstructor(true);

        const response = await instructorApi.getOne(id);

        if (!mounted) return;

        console.log(
          "Instructor API response:",
          response.data
        );

        const data = response?.data;


        const instructor =
          data?.instructor ||
          data?.data ||
          data;

        if (!instructor) {
          throw new Error(
            "Instructor information was not returned."
          );
        }

        setValues({
          first_name: instructor.first_name || "",
          last_name: instructor.last_name || "",
          email: instructor.email || "",
          phone: instructor.phone || "",
          department_id:
            instructor.department_id !== null &&
            instructor.department_id !== undefined
              ? String(instructor.department_id)
              : ""
        });

      } catch (error) {
        console.error(
          "Failed to load instructor:",
          error
        );

        if (!mounted) return;

        toast.error(
          extractErrorMessage(
            error,
            "Unable to load this instructor."
          )
        );
      } finally {
        if (mounted) {
          setIsLoadingInstructor(false);
        }
      }
    }

    loadInstructor();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  /*
   * ============================================================
   * HANDLE FORM CHANGE
   * ============================================================
   */
  function handleChange(e) {
    const { name, value } = e.target;

    setValues((previous) => ({
      ...previous,
      [name]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const fieldErrors = validateFields(values, {
      first_name: [isRequired],
      last_name: [isRequired],
      email: [isRequired, isEmail],
      phone: [isRequired, isPhone],
      department_id: [isRequired]
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),


        department_id: Number(values.department_id)
      };

      console.log(
        "Instructor payload:",
        payload
      );

      if (isEditMode) {
        await instructorApi.update(id, payload);

        toast.success(
          "Instructor updated successfully."
        );
      } else {
        await instructorApi.create(payload);

        toast.success(
          "Instructor created successfully."
        );
      }

      navigate("/instructors");

    } catch (error) {
      console.error(
        "Instructor save error:",
        error
      );

      toast.error(
        extractErrorMessage(
          error,
          isEditMode
            ? "Unable to update instructor."
            : "Unable to create instructor."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * ============================================================
   * LOADING EDIT PAGE
   * ============================================================
   */
  if (isLoadingInstructor) {
    return (
      <DashboardLayout>
        <Loading label="Loading instructor..." />
      </DashboardLayout>
    );
  }

  /*
   * ============================================================
   * FORM
   * ============================================================
   */
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiUserPlus size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            {isEditMode
              ? "Edit Instructor"
              : "Add Instructor"}
          </h1>
        </div>

        <Card className="p-6">

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >

            {/* First and Last Name */}
            <div className="grid sm:grid-cols-2 gap-4">

              <FormField
                label="First Name"
                name="first_name"
                value={values.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
                placeholder="Enter first name"
              />

              <FormField
                label="Last Name"
                name="last_name"
                value={values.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
                placeholder="Enter last name"
              />

            </div>

            {/* Email */}
            <FormField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="instructor@university.edu"
            />

            {/* Phone */}
            <FormField
              label="Phone"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              placeholder="+251 9xx xxx xxx"
            />

            {/* Department */}
            <FormField
              as="select"
              label="Department"
              name="department_id"
              value={values.department_id}
              onChange={handleChange}
              error={errors.department_id}
              required
              disabled={loadingDepartments}
              options={departments}
              placeholder={
                loadingDepartments
                  ? "Loading departments..."
                  : departments.length === 0
                  ? "No departments found"
                  : "Select department"
              }
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  navigate("/instructors")
                }
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm border border-line text-ink hover:bg-paper transition disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  loadingDepartments ||
                  departments.length === 0
                }
                className="flex-1 py-2.5 rounded-lg text-sm bg-navy-700 text-white hover:bg-navy-800 transition disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Create Instructor"}
              </button>

            </div>

          </form>

        </Card>
      </div>
    </DashboardLayout>
  );
}

