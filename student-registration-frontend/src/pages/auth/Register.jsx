import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  validateFields,
  isRequired,
  isEmail,
  minLength,
  passwordsMatch
} from "../../utils/validators";

const initialValues = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
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
      username: [isRequired],
      first_name: [isRequired],
      last_name: [isRequired],
      email: [isRequired, isEmail],
      password: [isRequired, minLength(8)]
    });

    const confirmError = passwordsMatch(values.password, values.confirmPassword);
    if (confirmError) fieldErrors.confirmPassword = confirmError;

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { confirmPassword, ...payload } = values;
    const result = await register(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Account created. Please log in.");
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Set up registrar access to the system.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Username"
          name="username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          required
          placeholder="e.g. registrar1"
        />

        <div className="grid grid-cols-2 gap-3">
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

        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="you@university.edu"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
          helpText="At least 8 characters."
        />

        <FormField
          label="Confirm Password"
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
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-navy-700 font-medium hover:text-navy-900">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
