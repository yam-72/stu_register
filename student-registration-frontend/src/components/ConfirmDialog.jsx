import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  itemLabel,
  description,
  confirmLabel = "Delete",
  isLoading = false,
  tone = "danger"
}) {
  const confirmClasses =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-navy-600 hover:bg-navy-700";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-line text-ink hover:bg-paper transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm rounded-lg text-white transition disabled:opacity-60 ${confirmClasses}`}
          >
            {isLoading ? "Working..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted">
        {description || "This action cannot be undone."}
      </p>
      {itemLabel && (
        <p className="mt-3 font-medium text-ink bg-paper rounded-lg px-3 py-2 border border-line">
          {itemLabel}
        </p>
      )}
    </Modal>
  );
}
