import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { validateFields, isRequired, isEmail } from "../../utils/validators";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validateFields({ email }, { email: [isRequired, isEmail] });
    if (fieldErrors.email) {
      setError(fieldErrors.email);
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setIsSent(true);
    } else {
      toast.error(result.message);
    }
  }

  if (isSent) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center py-4">
          <FiCheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-muted">
            If an account exists for <span className="font-medium text-ink">{email}</span>, reset
            instructions are on their way.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-sm font-medium text-navy-700 hover:text-navy-900"
          >
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you reset instructions."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
          required
          placeholder="you@university.edu"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-navy-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 transition disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        Remembered your password?{" "}
        <Link to="/login" className="text-navy-700 font-medium hover:text-navy-900">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
