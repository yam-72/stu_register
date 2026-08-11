
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";
import PhotoUpload from "../../components/PhotoUpload";
import Loading from "../../components/Loading";
import { studentApi } from "../../api/studentApi";
import { departmentApi } from "../../api/departmentApi";
import { useLookupOptions } from "../../hooks/useLookupOptions";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import {
  validateFields,
  isRequired,
  isEmail,
  isPhone
} from "../../utils/validators";

const initialValues = {
  registration_number: "",
  first_name: "",
  last_name: "",
  gender: "",
  email: "",
  phone: "",
  date_of_birth: "",
  address: "",
  department_id: "",
  admission_year: "",
  status: "active"
};

const GENDER_OPTIONS = [
  {
    value: "Male",
    label: "Male"
  },
  {
    value: "Female",
    label: "Female"
  }
];

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active"
  },
  {
    value: "inactive",
    label: "Inactive"
  },
  {
    value: "graduated",
    label: "Graduated"
  },
  {
    value: "suspended",
    label: "Suspended"
  }
];

export default function StudentForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [student, setStudent] = useState(null);

  const { options: departmentOptions } = useLookupOptions(
    departmentApi.getAll,
    (d) => ({
      value: d.department_id,
      label: `${d.department_code || ""} - ${d.department_name || ""}`
    })
  );

  useEffect(() => {
    if (!isEditMode) return;

    studentApi
      .getOne(id)
      .then(({ data }) => {
        const s = data?.student || data?.data || data;

        setStudent(s);

        setValues({
          registration_number:
            s.registration_number || "",

          first_name:
            s.first_name || "",

          last_name:
            s.last_name || "",

          gender:
            s.gender || "",

          email:
            s.email || "",

          phone:
            s.phone || "",

          date_of_birth:
            s.date_of_birth
              ? s.date_of_birth.slice(0, 10)
              : "",

          address:
            s.address || "",

          department_id:
            s.department_id || "",

          admission_year:
            s.admission_year || "",

          status:
            s.status || "active"
        });
      })
      .catch((err) =>
        toast.error(
          extractErrorMessage(
            err,
            "Unable to load this student."
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
      registration_number: [isRequired],
      first_name: [isRequired],
      last_name: [isRequired],
      gender: [isRequired],
      email: [isRequired, isEmail],
      phone: [isRequired, isPhone],
      department_id: [isRequired],
      admission_year: [isRequired]
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error(
        "Please correct the highlighted fields."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await studentApi.update(id, values);

        toast.success(
          "Student updated successfully"
        );
      } else {
        const { data } =
          await studentApi.create(values);

        toast.success(
          "Student created successfully"
        );

        const newId =
          data?.student?.student_id ||
          data?.student?.id ||
          data?.data?.student_id ||
          data?.data?.id ||
          data?.student_id ||
          data?.id;

        if (newId) {
          navigate(`/students/${newId}/edit`);
          return;
        }
      }

      navigate("/students");
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          "Unable to save this student."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePhotoUpload(formData) {
    setIsUploadingPhoto(true);

    try {
      await studentApi.uploadPhoto(id, formData);

      toast.success(
        "Photo uploaded successfully"
      );
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          "Unable to upload photo."
        )
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading student..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="max-w-3xl mx-auto">

        <div className="flex items-center gap-2 mb-6">

          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiUserPlus size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            {isEditMode
              ? "Edit Student"
              : "Add Student"}
          </h1>

        </div>

        <div className="grid md:grid-cols-3 gap-5">

          {isEditMode && (
            <Card className="p-6 h-fit md:order-2">

              <PhotoUpload
                student={student}
                onUpload={handlePhotoUpload}
                isUploading={isUploadingPhoto}
              />

            </Card>
          )}

          <Card
            className={`p-6 ${
              isEditMode
                ? "md:col-span-2 md:order-1"
                : "md:col-span-3"
            }`}
          >

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              noValidate
            >

              <div className="grid sm:grid-cols-2 gap-4">

                <FormField
                  label="Registration Number"
                  name="registration_number"
                  value={values.registration_number}
                  onChange={handleChange}
                  error={errors.registration_number}
                  required
                  placeholder="e.g. UGR/1234/15"
                />

                <FormField
                  label="Admission Year"
                  name="admission_year"
                  type="number"
                  value={values.admission_year}
                  onChange={handleChange}
                  error={errors.admission_year}
                  required
                  placeholder="e.g. 2023"
                />

              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <FormField
                  label="First Name"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  required
                />

                <FormField
                  label="Last Name"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  required
                />

              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <FormField
                  as="select"
                  label="Gender"
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  error={errors.gender}
                  required
                  options={GENDER_OPTIONS}
                  placeholder="Select gender"
                />

                <FormField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={values.date_of_birth}
                  onChange={handleChange}
                  error={errors.date_of_birth}
                />

              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  placeholder="student@university.edu"
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  placeholder="+251 9xx xxx xxx"
                />

              </div>

              <FormField
                as="textarea"
                label="Address"
                name="address"
                value={values.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="Street, city, region"
              />

              <div className="grid sm:grid-cols-2 gap-4">

                <FormField
                  as="select"
                  label="Department"
                  name="department_id"
                  value={values.department_id}
                  onChange={handleChange}
                  error={errors.department_id}
                  required
                  options={departmentOptions}
                  placeholder={
                    departmentOptions.length === 0
                      ? "No departments available"
                      : "Select department"
                  }
                />

                <FormField
                  as="select"
                  label="Status"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  error={errors.status}
                  options={STATUS_OPTIONS}
                />

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => navigate("/students")}
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
                    : "Create Student"}
                </button>

              </div>

            </form>

          </Card>

        </div>

      </div>

    </DashboardLayout>
  );
}

