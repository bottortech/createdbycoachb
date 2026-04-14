"use client";

import { motion } from "framer-motion";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

export default function AppointmentsScene(_props: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Appointments
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Book a 1:1 with Coach B
        </h2>
        <p
          className="mx-auto mt-3 max-w-md text-sm text-gallery-light/60"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
        >
          For product strategy, creative direction, business discussion, and project guidance.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-black/40 p-8 backdrop-blur-sm md:p-10"
      >
        <span className="inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
          30 Minutes
        </span>
        <div className="mb-5 mt-3">
          <span className="text-4xl font-extralight text-gallery-white">$75</span>
          <span className="ml-2 text-sm text-gallery-muted/60">per session</span>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-gallery-muted">
          A focused session for quick strategy, feedback, or guidance on a specific question or challenge.
        </p>
        <a
          href="https://calendly.com/byron-brown31/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl bg-gallery-accent py-3.5 text-sm font-medium tracking-wide text-gallery-black transition-all hover:bg-gallery-accent/90 hover:shadow-lg hover:shadow-gallery-accent/20"
        >
          Book 30 Minutes
        </a>
        <p className="mt-4 text-center text-[10px] text-gallery-muted/40">
          Sessions are conducted via video call
        </p>
      </motion.div>
    </div>
  );
}
