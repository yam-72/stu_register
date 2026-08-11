import React from "react";
import { FiInbox, FiAlertTriangle } from "react-icons/fi";

export default function EmptyState({
  title = "Nothing here yet.",
  description,
  actionLabel,
  onAction,
  variant = "empty",
  icon: CustomIcon
}) {
  const Icon = CustomIcon || (variant === "error" ? FiAlertTriangle : FiInbox);
  const iconTone = variant === "error" ? "text-red-500" : "text-navy-300";

  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className={`mb-3 ${iconTone}`}>
        <Icon size={36} />
      </div>
      <p className="font-display text-base text-navy-800">{title}</p>
      {description && <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-navy-700 text-white hover:bg-navy-800 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
