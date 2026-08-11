import React from "react";

export default function Footer() {
  return (
    <footer className="px-6 py-4 text-center text-xs text-muted border-t border-line">
      © {new Date().getFullYear()} Student Registration Management System · Registrar Office
    </footer>
  );
}
