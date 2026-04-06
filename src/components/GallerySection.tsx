"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GallerySectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  spotlight?: boolean;
  spotlightGold?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function GallerySection({
  id,
  children,
  className = "",
  spotlight = false,
  spotlightGold = false,
}: GallerySectionProps) {
  return (
    <section
      id={id}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
    >
      {/* Static ambient spotlight */}
      {spotlight && (
        <div className="pointer-events-none absolute inset-0 spotlight" />
      )}
      {spotlightGold && (
        <div className="pointer-events-none absolute inset-0 spotlight-gold" />
      )}

      {/* Animated gold spotlight reveal on scroll */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-32 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gallery-accent/[0.04] blur-[140px]"
      />

      {/* Background deepen overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gallery-black/40 via-transparent to-gallery-black/40"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12 lg:py-32"
      >
        {children}
      </motion.div>
      <div className="gallery-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
