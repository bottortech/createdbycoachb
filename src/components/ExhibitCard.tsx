"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ExhibitCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ExhibitCard({
  children,
  className = "",
  delay = 0,
}: ExhibitCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className={`gallery-frame rounded-2xl p-6 md:p-8 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
