import React from "react";
import { motion } from "framer-motion";
import Seal from "./Seal";

export default function Loading({ label = "Loading...", full = false }) {
  if (full) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        >
          <Seal size={44} tone="light" />
        </motion.div>
        <p className="text-sm text-muted font-body">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-10 text-muted">
      <span className="h-4 w-4 rounded-full border-2 border-navy-300 border-t-navy-600 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-line last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3 rounded bg-navy-100 animate-pulse"
              style={{ width: c === 0 ? "10%" : `${80 / cols}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl2 bg-white shadow-card p-5 space-y-3">
      <div className="h-3 w-1/3 rounded bg-navy-100 animate-pulse" />
      <div className="h-7 w-1/2 rounded bg-navy-100 animate-pulse" />
      <div className="h-2 w-2/3 rounded bg-navy-50 animate-pulse" />
    </div>
  );
}
