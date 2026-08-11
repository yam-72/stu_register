import React, { useEffect, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({ value, onChange, placeholder = "Search...", delay = 350 }) {
  const [term, setTerm] = useState(value || "");

  useEffect(() => {
    const handle = setTimeout(() => {
      if (term !== value) onChange(term);
    }, delay);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  useEffect(() => {
    setTerm(value || "");
  }, [value]);

  return (
    <div className="relative w-full sm:w-72">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-line bg-white focus:border-navy-400 outline-none transition"
        aria-label={placeholder}
      />
      {term && (
        <button
          onClick={() => setTerm("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          aria-label="Clear search"
        >
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
