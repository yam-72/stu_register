import React from "react";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  graduated: "bg-navy-50 text-navy-700 border-navy-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  dropped: "bg-red-50 text-red-700 border-red-200",
  registered: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export default function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  const style = STATUS_STYLES[key] || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${style}`}
    >
      {status || "Unknown"}
    </span>
  );
}
