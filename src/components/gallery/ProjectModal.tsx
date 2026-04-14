"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";

export interface Project {
  title: string;
  category: string;
  image: string;
  description: string;
  tags?: string[];
  link?: string;
  linkLabel?: string;
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

/**
 * A gallery-style modal for viewing a framed project up close.
 * Shows a large image with title, category, description, tags,
 * and an optional external link CTA.
 * Closes on Esc, backdrop click, or the close button.
 */
export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const open = Boolean(project);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md md:p-10"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/[0.08] bg-gallery-charcoal/95 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)]"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-gallery-white backdrop-blur-md transition-all hover:border-gallery-accent/40 hover:bg-gallery-accent hover:text-gallery-black"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Spotlight above image */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-32 w-[70%] -translate-x-1/2 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,230,180,0.12) 0%, rgba(201,168,76,0.06) 40%, transparent 70%)",
              }}
            />

            {/* Image area */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-gallery-black">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gallery-charcoal/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-6 md:p-10">
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
                {project.category}
              </span>
              <h3 className="mt-3 text-2xl font-light text-gallery-white md:text-4xl">
                {project.title}
              </h3>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-gallery-muted md:text-base">
                {project.description}
              </p>

              {project.tags && project.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gallery-accent-soft px-3 py-1 text-[11px] font-medium text-gallery-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {project.link && (
                <div className="mt-8">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gallery-accent px-7 py-3 text-sm font-medium tracking-wide text-gallery-black transition-all hover:bg-gallery-accent/90 hover:shadow-lg hover:shadow-gallery-accent/20"
                  >
                    {project.linkLabel || "Visit Project"}
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
