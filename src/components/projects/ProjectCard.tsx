"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ProjectEntry } from "@/data/projects";

function ArrowIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

interface ProjectCardProps {
  project: ProjectEntry;
  onSelect: (project: ProjectEntry) => void;
  /** "featured" gets a full-bleed poster treatment; "standard"/"compact"
   *  keep the classic image-over-content card, just scaled down. */
  variant?: "featured" | "standard" | "compact";
}

export default function ProjectCard({ project, onSelect, variant = "standard" }: ProjectCardProps) {
  const isFeatured = variant === "featured";

  return (
    <motion.div
      onClick={() => onSelect(project)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 transition-colors duration-300 hover:border-gallery-accent/25 ${
        isFeatured ? "min-h-[320px]" : "flex flex-col"
      }`}
    >
      {isFeatured ? (
        <>
          {/* Full-bleed poster treatment for flagship work */}
          <div className="absolute inset-0">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gallery-black/90 via-gallery-black/30 to-transparent" />
          </div>
          <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gallery-accent">
                {project.category}
              </span>
              {project.status && (
                <span className="rounded-full border border-gallery-accent/30 bg-gallery-black/50 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-gallery-accent backdrop-blur-sm">
                  {project.status}
                </span>
              )}
            </div>
            <h3 className="text-xl font-light leading-snug text-gallery-white sm:text-2xl">
              {project.title}
            </h3>
            <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-gallery-muted line-clamp-2">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(project.tags ?? []).slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[9px] font-medium text-gallery-white/80 backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-5 inline-flex w-fit items-center gap-1.5 text-[11px] font-medium text-gallery-accent hover:underline"
              >
                {project.linkLabel ?? "View Project"} <ArrowIcon />
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          <div
            className={`relative w-full shrink-0 overflow-hidden bg-gallery-dark ${
              variant === "standard" ? "h-40" : "h-28"
            }`}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gallery-charcoal/70 to-transparent" />
            {project.status && (
              <span className="absolute right-2.5 top-2.5 rounded-full border border-gallery-accent/30 bg-gallery-black/60 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-gallery-accent backdrop-blur-sm">
                {project.status}
              </span>
            )}
          </div>
          <div className={`flex flex-1 flex-col ${variant === "standard" ? "p-5" : "p-4"}`}>
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gallery-accent">
              {project.category}
            </span>
            <h3
              className={`mt-1.5 font-light leading-snug text-gallery-white ${
                variant === "standard" ? "text-base" : "text-[13px]"
              }`}
            >
              {project.title}
            </h3>
            {variant === "standard" && (
              <p className="mt-2 text-[12px] leading-relaxed text-gallery-muted line-clamp-2">
                {project.description}
              </p>
            )}
            <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
              {(project.tags ?? []).slice(0, variant === "standard" ? 3 : 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gallery-accent-soft px-2 py-0.5 text-[8px] font-medium text-gallery-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
