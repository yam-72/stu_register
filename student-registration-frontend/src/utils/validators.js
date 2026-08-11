// Small, dependency-free validators used across the app's forms.

export const isRequired = (value) =>
  value === undefined || value === null || String(value).trim() === ""
    ? "This field is required."
    : "";

export const isEmail = (value) => {
  if (!value) return "";
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) ? "" : "Enter a valid email address.";
};

export const isPhone = (value) => {
  if (!value) return "";
  const pattern = /^[+]?[\d\s-()]{7,15}$/;
  return pattern.test(value) ? "" : "Enter a valid phone number.";
};

export const minLength = (min) => (value) => {
  if (!value) return "";
  return String(value).length < min
    ? `Must be at least ${min} characters.`
    : "";
};

export const isPositiveNumber = (value) => {
  if (value === undefined || value === null || value === "") return "";

  const num = Number(value);

  return Number.isFinite(num) && num > 0
    ? ""
    : "Enter a valid positive number.";
};

export const isInRange = (min, max) => (value) => {
  if (value === undefined || value === null || value === "") return "";

  const num = Number(value);

  if (!Number.isFinite(num)) {
    return "Enter a valid number.";
  }

  return num >= min && num <= max
    ? ""
    : `Must be between ${min} and ${max}.`;
};

export const passwordsMatch = (password, confirm) =>
  password === confirm ? "" : "Passwords do not match.";

/**
 * Runs a set of { field: [validatorFns] } rules against a values object.
 * Returns an errors object with only the fields that failed.
 */
export function validateFields(values, rules) {
  const errors = {};

  Object.entries(rules).forEach(([field, validators]) => {
    for (const validate of validators) {
      if (typeof validate !== "function") {
        continue;
      }

      const message = validate(values[field]);

      if (message) {
        errors[field] = message;
        break;
      }
    }
  });

  return errors;
}