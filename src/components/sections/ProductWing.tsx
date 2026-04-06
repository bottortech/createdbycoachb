"use client";

import Image from "next/image";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import ExhibitCard from "../ExhibitCard";
import GalleryButton from "../GalleryButton";

const products = [
  {
    name: "RetroRack.app",
    type: "Web Application",
    description:
      "A web based platform for collecting, organizing, and showcasing retro tech. Built for enthusiasts who appreciate the beauty of vintage hardware and want a clean way to catalog their collection.",
    tags: ["Web App", "React", "Full Stack"],
    cta: "Visit RetroRack",
    ctaLink: "https://retrorack.app/",
    image: "/images/retrorack-web-app.png",
  },
  {
    name: "RetroRack Extension",
    type: "Chrome Extension",
    description:
      "The companion browser extension for RetroRack. Clip retro finds from anywhere on the web, save references, and add items to your collection without leaving the page.",
    tags: ["Chrome Extension", "Browser Tool"],
    cta: "Get the Extension",
    ctaLink: "https://chromewebstore.google.com/detail/dmofdijhloefhkhheimljfjchccgnhgf?utm_source=item-share-cb",
    image: "/images/retrorack-extension.jpg",
  },
  {
    name: "Bottor Assist",
    type: "AI Powered Tool",
    description:
      "An intelligent assistant platform designed to streamline workflows, automate repetitive tasks, and bring AI capabilities into everyday business operations with a clean, intuitive interface.",
    tags: ["AI", "Automation", "Productivity"],
    cta: "Explore Bottor Assist",
    ctaLink: "https://bottor-assist-xxxxx.lovable.app/",
    image: "/images/bottor-assist.png",
  },
];

export default function ProductWing() {
  return (
    <GallerySection id="product-wing" spotlight>
      <SectionLabel
        label="Product Wing"
        title="Active Products"
        description="Tools and platforms built to solve real problems. Each product represents a focused effort to create something useful, well designed, and built to last."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product, i) => (
          <ExhibitCard key={product.name} delay={i * 0.1}>
            {/* Product image */}
            <div className="mb-6 aspect-video overflow-hidden rounded-xl border border-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.06)]">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={338}
                className="h-full w-full object-cover scale-110"
              />
            </div>

            {/* Product type */}
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
              {product.type}
            </span>

            {/* Product name */}
            <h3 className="mt-2 text-xl font-light text-gallery-white">
              {product.name}
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

            {/* CTA */}
            <div className="mt-6">
              <GalleryButton href={product.ctaLink} variant="outline">
                {product.cta}
              </GalleryButton>
            </div>
          </ExhibitCard>
        ))}
      </div>
    </GallerySection>
  );
}
