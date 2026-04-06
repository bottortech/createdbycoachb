"use client";

import { motion } from "framer-motion";

interface SectionLabelProps {
  label: string;
  title: string;
  description?: string;
}

export default function SectionLabel({
  label,
  title,
  description,
}: SectionLabelProps) {
  return (
    <div className="mb-16">
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.3em] text-gallery-accent"
      >
        {label}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        className="text-3xl font-light tracking-tight text-gallery-white md:text-5xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 max-w-2xl text-lg text-gallery-muted"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
