import React, { useRef, useState } from "react";
import { FiCamera, FiUser } from "react-icons/fi";
import { resolveUploadUrl, initials } from "../utils/formatters";

export default function PhotoUpload({ student, onUpload, isUploading }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const existingPhoto = resolveUploadUrl(student?.photo || student?.photo_url);

  function handleSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      // Parent handles the toast; we just refuse to preview a non-image.
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("photo", file);
    onUpload(formData);
  }

  const displaySrc = preview || existingPhoto;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-card bg-navy-100 flex items-center justify-center">
          {displaySrc ? (
            <img src={displaySrc} alt="Student" className="h-full w-full object-cover" />
          ) : student ? (
            <span className="font-display text-2xl text-navy-600">{initials(student)}</span>
          ) : (
            <FiUser size={36} className="text-navy-400" />
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-navy-700 text-white flex items-center justify-center shadow-pop hover:bg-navy-800 transition"
          aria-label="Upload photo"
        >
          <FiCamera size={15} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleSelect}
          className="hidden"
        />
      </div>
      <p className="text-xs text-muted">{isUploading ? "Uploading photo..." : "JPG or PNG, up to 5MB"}</p>
    </div>
  );
}
