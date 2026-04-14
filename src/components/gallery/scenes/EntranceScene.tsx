"use client";

import { motion } from "framer-motion";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

export default function EntranceScene(_props: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.1 }}
        className="mb-6 inline-block text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/90"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
      >
        Welcome to the Gallery
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="mb-6 max-w-5xl text-4xl font-extralight leading-tight tracking-tight text-gallery-white sm:text-5xl md:text-7xl lg:text-8xl"
        style={{ textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}
      >
        Everything Here Was
        <br />
        <span className="text-gallery-accent">Created by Coach B</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-4 text-lg font-light tracking-wide text-gallery-light md:text-xl"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
      >
        Builder. Designer. Founder. Author. Artist.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="max-w-[600px] text-base leading-relaxed text-gallery-light/70"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
      >
        Creating products, systems, and experiences that solve real problems
        and push ideas forward.
      </motion.p>
    </div>
  );
}
