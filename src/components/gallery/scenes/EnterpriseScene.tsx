"use client";

import { motion } from "framer-motion";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const capabilities = [
  { title: "Software Development", description: "Custom web applications, mobile solutions, and enterprise software built with modern frameworks and scalable architecture." },
  { title: "Automation Tools", description: "Intelligent workflow automation, process optimization, and AI integrated solutions that reduce manual effort and increase efficiency." },
  { title: "UI and UX Systems", description: "User interface design, experience architecture, and design systems that prioritize usability, accessibility, and visual clarity." },
  { title: "Digital Product Development", description: "End to end product strategy, prototyping, development, and deployment for digital products built to perform and scale." },
  { title: "Professional Services", description: "Consulting, technical advisory, and strategic support for organizations looking to modernize their digital infrastructure." },
  { title: "AI and Data Solutions", description: "Machine learning integration, data analysis tools, and intelligent systems designed to enhance decision making and operational output." },
];

export default function EnterpriseScene(_props: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Enterprise Hall
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Bottor Technologies Inc.
        </h2>
        <p
          className="mx-auto mt-3 max-w-xl text-sm text-gallery-light/60"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}
        >
          Technology solutions for government, enterprise, and forward thinking organizations.
        </p>
      </motion.div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap, i) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
            className="rounded-xl border border-white/[0.06] bg-black/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gallery-accent/20"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gallery-accent-soft">
              <span className="text-xs text-gallery-accent">&#9670;</span>
            </div>
            <h4 className="text-sm font-medium text-gallery-white">{cap.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-gallery-muted">{cap.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex gap-3"
      >
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="rounded-full bg-gallery-accent px-5 py-2.5 text-xs font-medium text-gallery-black transition-all hover:bg-gallery-accent/90"
        >
          Request Capabilities
        </a>
        <a
          href="https://drive.google.com/file/d/1XmDidqSyxh_tNgDYXagU_YvNmm1Nx8-C/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gallery-gray px-5 py-2.5 text-xs font-medium text-gallery-light transition-all hover:border-gallery-accent hover:text-gallery-accent"
        >
          Download PDF
        </a>
      </motion.div>
    </div>
  );
}
