import React from "react";
import { motion } from "framer-motion";
import Seal from "../components/Seal";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-800 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="hairline absolute top-1/3 left-0 right-0" />
          <div className="hairline absolute top-2/3 left-0 right-0" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Seal size={40} tone="dark" />
          <div>
            <p className="font-display text-lg">Registrar</p>
            <p className="text-xs text-navy-300 tracking-wide">STUDENT REGISTRATION SYSTEM</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 max-w-md"
        >
          <p className="font-display text-3xl leading-snug">
            One record for every student, course, and grade.
          </p>
          <p className="text-navy-300 mt-4 text-sm leading-relaxed">
            The administration portal behind admissions, enrollment, and academic
            records — built for registrars who need the details right the first
            time.
          </p>
        </motion.div>

        <p className="relative z-10 text-xs text-navy-400">
          Addis Ababa University · Office of the Registrar
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <Seal size={32} tone="light" />
            <span className="font-display text-navy-800 text-base">Registrar</span>
          </div>
          <h1 className="font-display text-2xl text-navy-800">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-1.5 mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
