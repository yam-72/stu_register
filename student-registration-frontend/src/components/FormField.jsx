import React from "react";

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  as = "input",
  options = [],
  placeholder,
  disabled = false,
  className = "",
  rows = 3,
  helpText
}) {
  const baseClasses =
    "w-full px-3 py-2.5 text-sm rounded-lg border bg-white outline-none transition disabled:bg-paper disabled:text-muted";
  const borderClasses = error
    ? "border-red-400 focus:border-red-500"
    : "border-line focus:border-navy-400";

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {as === "select" ? (
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className={`${baseClasses} ${borderClasses}`}
        >
          <option value="" disabled>
            {placeholder || "Select an option"}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          className={`${baseClasses} ${borderClasses} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseClasses} ${borderClasses}`}
        />
      )}

      {helpText && !error && <p className="mt-1 text-xs text-muted">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
