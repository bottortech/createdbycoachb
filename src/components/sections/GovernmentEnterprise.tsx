"use client";

import { motion } from "framer-motion";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import ExhibitCard from "../ExhibitCard";
import GalleryButton from "../GalleryButton";

const capabilities = [
  {
    title: "Software Development",
    description:
      "Custom web applications, mobile solutions, and enterprise software built with modern frameworks and scalable architecture.",
  },
  {
    title: "Automation Tools",
    description:
      "Intelligent workflow automation, process optimization, and AI integrated solutions that reduce manual effort and increase efficiency.",
  },
  {
    title: "UI and UX Systems",
    description:
      "User interface design, experience architecture, and design systems that prioritize usability, accessibility, and visual clarity.",
  },
  {
    title: "Digital Product Development",
    description:
      "End to end product strategy, prototyping, development, and deployment for digital products built to perform and scale.",
  },
  {
    title: "Professional Services",
    description:
      "Consulting, technical advisory, and strategic support for organizations looking to modernize their digital infrastructure.",
  },
  {
    title: "AI and Data Solutions",
    description:
      "Machine learning integration, data analysis tools, and intelligent systems designed to enhance decision making and operational output.",
  },
];

export default function GovernmentEnterprise() {
  return (
    <GallerySection id="government-enterprise" spotlight>
      <SectionLabel
        label="Government & Enterprise"
        title="Bottor Technologies Inc."
        description="Delivering professional technology services, software solutions, and digital products to government and enterprise clients with reliability, precision, and modern standards."
      />

      {/* Company identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="gallery-frame mb-12 rounded-2xl p-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-light text-gallery-white">
              Bottor Technologies Inc.
            </h3>
            <p className="mt-2 text-gallery-muted">
              Technology solutions for government, enterprise, and forward
              thinking organizations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GalleryButton href="#commission-desk" variant="primary">
              Request Capabilities
            </GalleryButton>
            <GalleryButton href="https://drive.google.com/file/d/1XmDidqSyxh_tNgDYXagU_YvNmm1Nx8-C/view?usp=sharing" variant="outline">
              Download PDF
            </GalleryButton>
          </div>
        </div>
      </motion.div>

      {/* Capabilities grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap, i) => (
          <ExhibitCard key={cap.title} delay={i * 0.08}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gallery-accent-soft">
              <span className="text-sm text-gallery-accent">◆</span>
            </div>
            <h4 className="text-lg font-light text-gallery-white">
              {cap.title}
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-gallery-muted">
              {cap.description}
            </p>
          </ExhibitCard>
        ))}
      </div>

      {/* Credibility markers */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-gallery-muted/50">
          Capability statement and credentials available upon request
        </p>
      </motion.div>
    </GallerySection>
  );
}
