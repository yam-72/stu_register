import React from "react";

/**
 * The Seal is this app's signature element: a registrar's crest built from
 * two interlocking arcs (open + record) around a monogram. It stands in for
 * a logo across the login screen, sidebar, and empty states so the product
 * reads as an institution, not a template.
 */
export default function Seal({ size = 40, tone = "light", className = "" }) {
  const ring = tone === "light" ? "#E6C784" : "#C89B3C";
  const inner = tone === "light" ? "#F6F7FB" : "#0B1524";
  const mark = tone === "light" ? "#172C49" : "#F6F7FB";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Registrar seal"
    >
      <circle cx="24" cy="24" r="22" fill={inner} stroke={ring} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="17.5" fill="none" stroke={ring} strokeWidth="1" opacity="0.6" />
      <path
        d="M24 11 L35 16.5 V26 C35 33 30 37.5 24 39.5 C18 37.5 13 33 13 26 V16.5 Z"
        fill="none"
        stroke={mark}
        strokeWidth="1.4"
      />
      <path
        d="M18 22.5 L24 19 L30 22.5 V27.5 L24 31 L18 27.5 Z"
        fill={ring}
        opacity="0.9"
      />
    </svg>
  );
}
