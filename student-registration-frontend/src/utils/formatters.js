// Presentation-only helpers — never used for validation, only for display.

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function fullName(entity) {
  if (!entity) return "—";
  const first = entity.first_name || "";
  const last = entity.last_name || "";
  return `${first} ${last}`.trim() || "—";
}

export function initials(entity) {
  if (!entity) return "?";
  const first = (entity.first_name || "").charAt(0);
  const last = (entity.last_name || "").charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

export function resolveUploadUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base =
    process.env.REACT_APP_UPLOADS_BASE_URL || "http://localhost:5000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function gpaRemark(gpa) {
  const value = Number(gpa);
  if (!Number.isFinite(value)) return "—";
  if (value >= 3.75) return "Excellent";
  if (value >= 3.25) return "Very Good";
  if (value >= 2.75) return "Good";
  if (value >= 2.0) return "Satisfactory";
  return "Needs Improvement";
}

const GRADE_POINTS = {
  A: 4.0,
  "A-": 3.75,
  "B+": 3.5,
  B: 3.0,
  "B-": 2.75,
  "C+": 2.5,
  C: 2.0,
  "C-": 1.75,
  D: 1.0,
  F: 0.0
};

export function gradeToPoint(grade) {
  return GRADE_POINTS[grade] ?? null;
}

export function titleCase(value) {
  if (!value) return "";
  return String(value)
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
