import React from "react";
import { Link } from "react-router-dom";
import Seal from "../components/Seal";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-center px-6">
      <Seal size={48} tone="light" />
      <p className="font-mono text-sm text-navy-400 mt-6">Error 404</p>
      <h1 className="font-display text-2xl text-navy-800 mt-1">Page not found</h1>
      <p className="text-sm text-muted mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-5 py-2.5 rounded-lg text-sm font-medium bg-navy-700 text-white hover:bg-navy-800 transition"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
