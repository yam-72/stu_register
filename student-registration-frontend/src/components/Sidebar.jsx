import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiBriefcase,
  FiFolderPlus,
  FiBookOpen,
  FiPlusCircle,
  FiEdit3,
  FiClipboard,
  FiAward,
  FiPieChart,
  FiUserCheck,
  FiLock,
  FiLogOut,
  FiX
} from "react-icons/fi";
import { motion } from "framer-motion";
import Seal from "./Seal";
import { useAuth } from "../context/AuthContext";

const SECTIONS = [
  {
    heading: null,
    items: [{ to: "/dashboard", label: "Dashboard", icon: FiGrid }]
  },
  {
    heading: "Students",
    icon: FiUsers,
    items: [
      { to: "/students", label: "All Students", icon: FiUsers, end: true },
      { to: "/students/create", label: "Add Student", icon: FiUserPlus }
    ]
  },
  {
    heading: "Departments",
    icon: FiBriefcase,
    items: [
      { to: "/departments", label: "Departments", icon: FiBriefcase, end: true },
      { to: "/departments/create", label: "Add Department", icon: FiFolderPlus }
    ]
  },
  {
    heading: "Courses",
    icon: FiBookOpen,
    items: [
      { to: "/courses", label: "All Courses", icon: FiBookOpen, end: true },
      { to: "/courses/create", label: "Add Course", icon: FiPlusCircle }
    ]
  },
  {
    heading: "Registration",
    icon: FiClipboard,
    items: [
      { to: "/registrations/create", label: "Register Student", icon: FiEdit3 },
      { to: "/registrations", label: "Student Courses", icon: FiClipboard, end: true }
    ]
  },
  {
    heading: "Grades",
    icon: FiAward,
    items: [
      { to: "/grades/assign", label: "Assign Grade", icon: FiAward },
      { to: "/grades", label: "Student Grades", icon: FiPieChart, end: true }
    ]
  },
  {
    heading: "Instructors",
    icon: FiUserCheck,
    items: [
      { to: "/instructors", label: "All Instructors", icon: FiUserCheck, end: true },
      { to: "/instructors/create", label: "Add Instructor", icon: FiUserPlus }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  const content = (
    <div className="flex h-full flex-col bg-navy-800 text-navy-100">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-700/70">
        <Seal size={34} tone="dark" />
        <div>
          <p className="font-display text-white text-[15px] leading-tight">Registrar</p>
          <p className="text-[11px] text-navy-300 tracking-wide">STUDENT REGISTRATION SYSTEM</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto lg:hidden text-navy-300 hover:text-white"
          aria-label="Close menu"
        >
          <FiX size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {SECTIONS.map((section, idx) => (
          <div key={idx}>
            {section.heading && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
                {section.icon && <section.icon size={12} />}
                {section.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-navy-600 text-white font-medium"
                        : "text-navy-200 hover:bg-navy-700 hover:text-white"
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
            <FiLock size={12} /> Settings
          </p>
          <NavLink
            to="/change-password"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive ? "bg-navy-600 text-white font-medium" : "text-navy-200 hover:bg-navy-700 hover:text-white"
              }`
            }
          >
            <FiLock size={16} /> Change Password
          </NavLink>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-navy-700/70">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-red-600/90 hover:text-white transition"
        >
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={onClose} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 w-64"
          >
            {content}
          </motion.div>
        </div>
      )}
    </>
  );
}
