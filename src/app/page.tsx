"use client";

import { useState } from "react";
import { useIsClient } from "@/components/home/useIsClient";
import { getPublishedPredictions } from "@/data/predictions";
import { PROJECTS, type ProjectEntry } from "@/data/projects";
import ProjectModal from "@/components/gallery/ProjectModal";
import SiteHeader from "@/components/home/SiteHeader";
import Hero from "@/components/home/Hero";
import CertificationsStrip from "@/components/home/CertificationsStrip";
import WorkSection from "@/components/home/WorkSection";
import TechStackSection from "@/components/home/TechStackSection";
import TestimonialsGrid from "@/components/home/TestimonialsGrid";
import PredictionsSection from "@/components/home/PredictionsSection";
import EnterprisePanel from "@/components/home/EnterprisePanel";
import { ContactSection, HomeFooter } from "@/components/home/ContactAndFooter";

// Standard (non-3D) home page. The immersive gallery lives at /gallery and is
// untouched by this layout.
export default function Home() {
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | null>(null);
  const isClient = useIsClient();
  const year = isClient ? new Date().getFullYear() : null;
  const published = getPublishedPredictions();

  return (
    <>
      {/* globals.css locks <body> to a fixed 100vw × 100vh viewport for the 3D
          gallery. Undo that here so the page scrolls normally. `100vw` includes
          the scrollbar, which caused a sideways scroll, so width is reset too.
          Higher specificity (not !important) so ProjectModal's inline
          `overflow: hidden` scroll lock still wins while a modal is open. */}
      <style>{`
        html body { overflow-x: hidden; overflow-y: auto; height: auto; width: auto; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div className="min-h-screen bg-gallery-black text-gallery-white">
        <a
          href="#projects"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gallery-accent focus:px-4 focus:py-2 focus:text-gallery-black"
        >
          Skip to work
        </a>
        <SiteHeader />

        <main>
          <Hero predictionCount={published.length} />
          <CertificationsStrip />
          <WorkSection projects={PROJECTS} onSelect={setSelectedProject} />
          <TechStackSection />
          <TestimonialsGrid />
          <PredictionsSection published={published} />
          <EnterprisePanel />
          <ContactSection />
        </main>

        <HomeFooter year={year} />
      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
