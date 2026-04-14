"use client";

import Image from "next/image";
import { useState } from "react";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import FramedPiece from "../gallery/FramedPiece";
import ProjectModal, { Project } from "../gallery/ProjectModal";

const galleryItems: Project[] = [
  {
    title: "WiggleWoo Character",
    category: "Character Design",
    image: "/images/Wiggle-Woo-Character.png",
    description:
      "Original character design for WiggleWoo's Word Quest, the phonics driven reading adventure for early learners. The character anchors the brand identity and guides players through the experience.",
    tags: ["Character Design", "Illustration", "Branding"],
    link: "https://wigglewoo.app",
    linkLabel: "Visit WiggleWoo",
  },
  {
    title: "Carla's Creation",
    category: "Branding",
    image: "/images/carlas-creation.png",
    description:
      "Brand identity work crafted with a personal, refined touch. A study in elevated visual storytelling that balances warmth and elegance.",
    tags: ["Branding", "Identity", "Design"],
  },
  {
    title: "JB TV",
    category: "Graphics",
    image: "/images/jb-tv.png",
    description:
      "Visual graphics and branding for JB TV. A bold, contemporary look that brings the broadcast identity to life.",
    tags: ["Graphics", "Branding", "Identity"],
  },
  {
    title: "By Any Means",
    category: "Logo",
    image: "/images/By-any-means-logo.png",
    description:
      "Logo and identity design for By Any Means. A statement mark built to feel confident, focused, and bold across every surface.",
    tags: ["Logo", "Brand Mark", "Identity"],
  },
  {
    title: "Lush Brows",
    category: "Logo",
    image: "/images/lush-brows-logo.png",
    description:
      "Logo design for Lush Brows. A clean, refined mark that reflects the elegance and care of the brand.",
    tags: ["Logo", "Beauty", "Identity"],
  },
  {
    title: "RetroRack",
    category: "Logo",
    image: "/images/retro-rack-logo.png",
    description:
      "Brand mark for RetroRack, the platform built for collectors of vintage tech. The logo channels the warmth of retro hardware while feeling modern and clean.",
    tags: ["Logo", "Brand Mark", "Tech"],
    link: "https://retrorack.app/",
    linkLabel: "Visit RetroRack",
  },
];

export default function CreativeGallery() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <>
      <GallerySection id="creative-gallery" spotlight>
        <SectionLabel
          label="Creative Wing"
          title="Design Work"
          description="A curated wall of logos, brand marks, and visual identity work. Each piece is mounted and lit. Click any frame to enter the exhibit."
        />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
          {galleryItems.map((item, i) => (
            <FramedPiece
              key={item.title}
              frameType="square"
              delay={i * 0.08}
              onClick={() => setSelected(item)}
              plaque={{ title: item.title, subtitle: item.category }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </FramedPiece>
          ))}
        </div>
      </GallerySection>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
