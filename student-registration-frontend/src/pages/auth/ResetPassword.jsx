import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateFields, isRequired, minLength, passwordsMatch } from "../../utils/validators";

export default function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({ password: "", confirmPassword: "" });
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
      password: [isRequired, minLength(8)]
    });
    const confirmError = passwordsMatch(values.password, values.confirmPassword);
    if (confirmError) fieldErrors.confirmPassword = confirmError;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(token, values.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Password reset. Please log in.");
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="New Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
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
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        <Link to="/login" className="text-navy-700 font-medium hover:text-navy-900">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
