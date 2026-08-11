import React, { useState } from "react";
import { FiLock } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateFields, isRequired, minLength, passwordsMatch } from "../../utils/validators";

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validateFields(values, {
      currentPassword: [isRequired],
      newPassword: [isRequired, minLength(8)]
    });
    const confirmError = passwordsMatch(values.newPassword, values.confirmPassword);
    if (confirmError) fieldErrors.confirmPassword = confirmError;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(values.currentPassword, values.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Password changed successfully.");
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.message);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiLock size={16} />
          </div>
          <h1 className="font-display text-xl text-navy-800">Change Password</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={values.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              required
            />
            <FormField
              label="New Password"
              name="newPassword"
              type="password"
              value={values.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              required
              helpText="At least 8 characters."
            />
            <FormField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-navy-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
