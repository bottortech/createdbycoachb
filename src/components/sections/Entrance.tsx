"use client";

import { motion } from "framer-motion";
import GalleryButton from "../GalleryButton";

export default function Entrance() {
  return (
    <section
      id="entrance"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gallery-black via-gallery-charcoal to-gallery-black" />
        <div className="absolute left-1/2 top-1/3 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02] blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gallery-accent/[0.04] blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-gallery-accent/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 text-center md:px-12">
        {/* Gallery entrance marker */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <span className="inline-block text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/80">
            Welcome to the Gallery
          </span>
        </motion.div>

        {/* Statement headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mb-8 max-w-5xl text-center text-4xl font-extralight leading-tight tracking-tight text-gallery-white sm:text-5xl md:text-7xl lg:text-8xl"
        >
          Everything Here Was
          <br />
          <span className="text-gallery-accent">Created by Coach B</span>
        </motion.h1>

        {/* Roles */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-5 max-w-2xl text-center text-lg font-light tracking-wide text-gallery-muted md:text-xl"
        >
          Builder. Designer. Founder. Author. Artist.
        </motion.p>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mb-14 max-w-[640px] text-center text-base leading-relaxed text-gallery-muted/70"
        >
          Creating products, systems, and experiences that solve real problems
          and push ideas forward.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row"
        >
          <GalleryButton href="#featured-exhibit" variant="primary">
            Explore the Gallery
          </GalleryButton>
          <GalleryButton href="#product-wing" variant="outline">
            View Projects
          </GalleryButton>
          <GalleryButton href="#commission-desk" variant="secondary">
            Join Early Access
          </GalleryButton>
        </motion.div>
      </div>

      {/* Scroll to enter the collection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-gallery-muted/60">
            Scroll to enter the collection
          </span>
          <div className="h-10 w-px bg-gradient-to-b from-gallery-accent/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
