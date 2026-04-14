"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import ProjectModal, { Project } from "../gallery/ProjectModal";

const products: (Project & { type: string; tags: string[] })[] = [
  {
    title: "RetroRack.app",
    type: "Web Application",
    category: "Web Application",
    description:
      "A web based platform for collecting, organizing, and showcasing retro tech. Built for enthusiasts who appreciate the beauty of vintage hardware and want a clean way to catalog their collection.",
    tags: ["Web App", "React", "Full Stack"],
    image: "/images/retrorack-web-app.png",
    link: "https://retrorack.app/",
    linkLabel: "Visit RetroRack",
  },
  {
    title: "RetroRack Extension",
    type: "Chrome Extension",
    category: "Chrome Extension",
    description:
      "The companion browser extension for RetroRack. Clip retro finds from anywhere on the web, save references, and add items to your collection without leaving the page.",
    tags: ["Chrome Extension", "Browser Tool"],
    image: "/images/retrorack-extension.jpg",
    link: "https://chromewebstore.google.com/detail/dmofdijhloefhkhheimljfjchccgnhgf?utm_source=item-share-cb",
    linkLabel: "Get the Extension",
  },
  {
    title: "Bottor Assist",
    type: "AI Powered Tool",
    category: "AI Powered Tool",
    description:
      "An intelligent assistant platform designed to streamline workflows, automate repetitive tasks, and bring AI capabilities into everyday business operations with a clean, intuitive interface.",
    tags: ["AI", "Automation", "Productivity"],
    image: "/images/bottor-assist.png",
    link: "https://bottor-assist-xxxxx.lovable.app/",
    linkLabel: "Explore Bottor Assist",
  },
];

export default function ProductWing() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <>
      <GallerySection id="product-wing" spotlight>
        <SectionLabel
          label="Product Wing"
          title="Active Products"
          description="A walk through the working products. Each exhibit can be opened for a closer look."
        />

        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
          {products.map((product, i) => (
            <motion.button
              key={product.title}
              type="button"
              onClick={() => setSelected(product)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6 }}
              className="group relative block w-full text-left"
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute -inset-3 rounded-2xl opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, transparent 70%)",
                }}
              />

              {/* Spotlight above */}
              <div
                className="pointer-events-none absolute -top-8 left-1/2 h-24 w-3/4 -translate-x-1/2 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,225,170,0.10) 0%, transparent 70%)",
                }}
              />

              <div className="relative gallery-frame rounded-2xl p-6 transition-all duration-500 md:p-8">
                {/* Product image with subtle inner frame */}
                <div className="mb-6 aspect-video overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_0_30px_rgba(255,255,255,0.06)]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={600}
                    height={338}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </div>

                {/* Type label */}
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
                  {product.type}
                </span>

                {/* Title */}
                <h3 className="mt-2 text-xl font-light text-gallery-white group-hover:text-gallery-accent transition-colors duration-300">
                  {product.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-gallery-muted">
                  {product.description}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gallery-glow px-3 py-1 text-[10px] font-medium text-gallery-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* View hint */}
                <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gallery-accent/80 transition-colors duration-300 group-hover:text-gallery-accent">
                  View Exhibit
                  <svg
                    className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </GallerySection>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
