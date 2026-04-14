"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FramedPiece from "../FramedPiece";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const artworks: Project[] = [
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

export default function CreativeWallScene({ onSelectProject }: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Creative Wing
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Design Work
        </h2>
      </motion.div>

      {/* Gallery wall — all 6 pieces */}
      <div className="grid w-full max-w-6xl grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
        {artworks.map((art, i) => (
          <motion.div
            key={art.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 + i * 0.08 }}
          >
            <FramedPiece
              frameType="square"
              onClick={() => onSelectProject(art)}
              plaque={{ title: art.title, subtitle: art.category }}
            >
              <Image
                src={art.image}
                alt={art.title}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 25vw"
                className="object-cover"
              />
            </FramedPiece>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
