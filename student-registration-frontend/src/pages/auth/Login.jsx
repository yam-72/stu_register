import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateFields, isRequired, isEmail } from "../../utils/validators";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validateFields(values, {
      email: [isRequired, isEmail],
      password: [isRequired]
    });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.first_name || result.user.username}.`);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } else {
      toast.error(result.message);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage students, courses, and records.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

        <div className="relative">
          <FormField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            required
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[38px] text-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-navy-600 hover:text-navy-800 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-navy-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Login"}
          {!isSubmitting && <FiArrowRight size={15} />}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-navy-700 font-medium hover:text-navy-900">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
