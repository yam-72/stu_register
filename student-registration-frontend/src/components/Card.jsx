import React from "react";
import { motion } from "framer-motion";

export default function Card({ children, className = "", as: Component = motion.div, ...rest }) {
  return (
    <Component
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-xl2 shadow-card border border-line/60 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
