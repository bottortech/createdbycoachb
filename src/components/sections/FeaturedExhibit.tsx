"use client";

import Image from "next/image";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import GalleryButton from "../GalleryButton";
import { motion } from "framer-motion";

const tags = ["Interactive", "Phonics", "Early Reading", "Game Based Learning"];

export default function FeaturedExhibit() {
  return (
    <GallerySection id="featured-exhibit" spotlight spotlightGold>
      <SectionLabel
        label="Featured Exhibit"
        title="WiggleWoo's Word Quest"
        description="A phonics driven adventure where kids learn to read by building words, unlocking worlds, and progressing through structured gameplay."
      />

      <div className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16">
        {/* Device mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.4 } }}
          className="flex items-center justify-center p-4 md:p-6"
        >
          <div className="relative w-[90%] mx-auto overflow-hidden rounded-[7%] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <Image
              src="/images/ipad-game-view.png"
              alt="WiggleWoo Word Quest game preview on iPad"
              width={800}
              height={600}
              className="block h-auto w-full"
              priority
            />
          </div>
        </motion.div>

        {/* Project details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-light text-gallery-white md:text-3xl">
              WiggleWoo&apos;s Word Quest
            </h3>
            <p className="text-gallery-muted leading-relaxed">
              WiggleWoo&apos;s Word Quest is an interactive reading game designed
              for early learners. Players tap letters to form words, move through
              themed environments, and build real reading skills through play.
            </p>
            <p className="text-gallery-muted leading-relaxed">
              The experience is structured across multiple tiers, starting with
              simple CVC words and advancing into more complex patterns, giving
              each child a clear path of progression.
            </p>
            <p className="text-gallery-muted leading-relaxed">
              Each interaction reinforces phonics, blending, and recognition in a
              way that feels like a game, not a lesson.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gallery-accent-soft px-4 py-1.5 text-xs font-medium text-gallery-accent"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <GalleryButton href="https://wigglewoo.app" variant="primary">
              Join Waitlist
            </GalleryButton>
            <GalleryButton href="https://wigglewoo.app/#details" variant="outline">
              View Details
            </GalleryButton>
          </div>
        </motion.div>
      </div>
    </GallerySection>
  );
}
