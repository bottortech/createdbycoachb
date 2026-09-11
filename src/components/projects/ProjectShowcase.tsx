"use client";

import { useState } from "react";
import ProjectModal, { type Project } from "@/components/gallery/ProjectModal";
import ProjectCard from "./ProjectCard";
import type { ProjectEntry, ShowcaseSize } from "@/data/projects";

// Bento-grid layout for the standard page's project section. This is the
// single integration point page.tsx renders — swapping this out later for a
// <ProjectCarousel projects={PROJECTS} /> (same data, same ProjectCard tiles,
// same modal-on-click behavior) shouldn't require touching page.tsx or
// src/data/projects.ts at all.
interface ProjectShowcaseProps {
  projects: ProjectEntry[];
}

const SPAN_CLASSES: Record<ShowcaseSize, string> = {
  featured: "sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2",
  standard: "sm:col-span-2 sm:row-span-1 lg:col-span-2 lg:row-span-1",
  compact: "sm:col-span-1 sm:row-span-1 lg:col-span-1 lg:row-span-1",
};

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:auto-rows-[220px]"
        style={{ gridAutoFlow: "dense" }}
      >
        {projects.map((project) => {
          const size = project.showcaseSize ?? "standard";
          return (
            <div key={project.id} className={SPAN_CLASSES[size]}>
              <ProjectCard project={project} onSelect={setSelectedProject} variant={size} />
            </div>
          );
        })}
      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
