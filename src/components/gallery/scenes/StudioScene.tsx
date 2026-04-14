"use client";

import { motion } from "framer-motion";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const roles = [
  { title: "Builder", description: "Creating software, tools, and digital products from concept to launch." },
  { title: "Creative Technologist", description: "Blending design, code, and emerging tech to build unique experiences." },
  { title: "Product Creator", description: "Shipping real products that solve real problems for real people." },
  { title: "Founder", description: "Leading Bottor Technologies Inc. and building ventures from the ground up." },
  { title: "Author", description: "Writing stories that inspire imagination and make learning feel alive." },
];

export default function StudioScene(_props: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          The Studio
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          About Coach B
        </h2>
      </motion.div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
            className="rounded-xl border border-white/[0.06] bg-black/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gallery-accent/20"
          >
            <h4 className="text-sm font-medium text-gallery-white">{role.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-gallery-muted">{role.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-gallery-light/60"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
      >
        Every project, product, and piece of work in this gallery reflects a
        commitment to quality, creativity, and forward thinking. The goal is
        simple: build things that matter.
      </motion.p>
    </div>
  );
}
