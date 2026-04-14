"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FramedPiece from "../FramedPiece";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const wigglewoo: Project = {
  title: "WiggleWoo's Word Quest",
  category: "Featured Exhibit",
  image: "/images/ipad-game-view.png",
  description:
    "WiggleWoo's Word Quest is an interactive reading game designed for early learners. Players tap letters to form words, move through themed environments, and build real reading skills through play. The experience is structured across multiple tiers, starting with simple CVC words and advancing into more complex patterns, giving each child a clear path of progression.",
  tags: ["Interactive", "Phonics", "Early Reading", "Game Based Learning"],
  link: "https://wigglewoo.app",
  linkLabel: "Join Waitlist",
};

export default function FeaturedScene({ onSelectProject }: Props) {
  return (
    <div className="flex flex-col items-center">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Main Hall
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          WiggleWoo&apos;s Word Quest
        </h2>
      </motion.div>

      {/* Centered landscape frame */}
      <div className="w-full max-w-2xl">
        <FramedPiece
          frameType="landscape"
          onClick={() => onSelectProject(wigglewoo)}
          plaque={{ title: "WiggleWoo's Word Quest", subtitle: "A Phonics Adventure" }}
        >
          <Image
            src="/images/ipad-game-view.png"
            alt="WiggleWoo Word Quest"
            fill
            sizes="(max-width: 768px) 90vw, 640px"
            className="object-cover"
          />
        </FramedPiece>
      </div>
    </div>
  );
}
