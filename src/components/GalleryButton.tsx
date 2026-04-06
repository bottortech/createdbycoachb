"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GalleryButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  onClick?: () => void;
}

export default function GalleryButton({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
}: GalleryButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-all duration-300";

  const variants = {
    primary:
      "bg-gallery-accent text-gallery-black hover:bg-gallery-accent/90 hover:shadow-lg hover:shadow-gallery-accent/20",
    secondary:
      "bg-gallery-gray text-gallery-white hover:bg-gallery-gray/80",
    outline:
      "border border-gallery-gray text-gallery-light hover:border-gallery-accent hover:text-gallery-accent",
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  const Component = href ? "a" : "button";

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Component href={href} onClick={onClick} className={classes}>
        {children}
      </Component>
    </motion.div>
  );
}
