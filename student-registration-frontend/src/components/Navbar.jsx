import React, { useState } from "react";
import { FiMenu, FiBell, FiChevronDown, FiUser, FiLock, FiLogOut, FiSearch } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials, titleCase } from "../utils/formatters";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-line">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-navy-700 p-1.5 rounded-md hover:bg-paper"
          aria-label="Open menu"
        >
          <FiMenu size={20} />
        </button>

        <div className="hidden sm:flex items-center relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 text-muted" size={15} />
          <input
            type="text"
            placeholder="Search students, courses, instructors..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-paper border border-transparent focus:border-navy-300 focus:bg-white outline-none transition"
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <button
          className="relative p-2 rounded-full hover:bg-paper text-navy-700"
          aria-label="Notifications"
        >
          <FiBell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-400" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-paper transition"
          >
            <span className="h-8 w-8 rounded-full bg-navy-600 text-white flex items-center justify-center text-xs font-semibold">
              {initials(user)}
            </span>
            <span className="hidden sm:block text-left">
              <span className="block text-sm font-medium text-ink leading-tight">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="block text-[11px] text-muted leading-tight">
                {titleCase(user?.role)}
              </span>
            </span>
            <FiChevronDown size={14} className="text-muted hidden sm:block" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-pop border border-line z-20 py-1.5"
                >
                  <div className="px-3 py-2 border-b border-line mb-1">
                    <p className="text-sm font-medium text-ink truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/students"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-paper"
                  >
                    <FiUser size={15} /> Profile
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-paper"
                  >
                    <FiLock size={15} /> Change Password
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
