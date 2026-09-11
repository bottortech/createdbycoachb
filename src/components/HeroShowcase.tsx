"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getFlagshipProjects, getProject } from "@/data/projects";

// Offset image collage for the hero — leads with visual proof of the work
// instead of making a first-time visitor read text before seeing anything.
// The two flagship projects anchor the layout; a couple of supporting shots
// add texture. Pulled from the shared project catalog so this never drifts
// out of sync with what's actually flagship.
export default function HeroShowcase() {
  const [primary, secondary] = getFlagshipProjects();
  const supporting = getProject("retrorack");
  const accent = getProject("by-any-means");

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md lg:aspect-auto lg:h-[520px] lg:max-w-none">
      {/* Ambient glow behind the collage */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.14) 0%, transparent 65%)",
        }}
      />

      {/* Primary — RYMA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.6, ease: "easeOut" },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
        }}
        whileHover={{ scale: 1.02, rotate: 0, transition: { duration: 0.3 } }}
        className="absolute left-0 top-0 h-[62%] w-[78%] -rotate-2 overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
      >
        <Image
          src={primary.image}
          alt={primary.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 60vw, 32vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gallery-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-gallery-accent">
            {primary.category}
          </p>
          <p className="mt-1 text-sm font-light text-gallery-white">{primary.title}</p>
        </div>
      </motion.div>

      {/* Secondary — WiggleWoo, overlapping bottom-right */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 0.6, ease: "easeOut", delay: 0.15 },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
        }}
        whileHover={{ scale: 1.03, rotate: 0, transition: { duration: 0.3 } }}
        className="absolute bottom-[6%] right-0 h-[52%] w-[58%] rotate-3 overflow-hidden rounded-2xl border border-gallery-accent/25 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <Image
          src={secondary.image}
          alt={secondary.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 45vw, 24vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gallery-black/75 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-gallery-accent">
            {secondary.category}
          </p>
          <p className="mt-1 text-[13px] font-light text-gallery-white">{secondary.title}</p>
        </div>
      </motion.div>

      {/* Supporting accent tile — tucked top-right for texture */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, rotate: [-6, -4, -6] }}
        transition={{
          opacity: { duration: 0.6, ease: "easeOut", delay: 0.3 },
          scale: { duration: 0.6, ease: "easeOut", delay: 0.3 },
          rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
        whileHover={{ scale: 1.08, rotate: 0, transition: { duration: 0.3 } }}
        className="absolute -right-3 top-[8%] hidden h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-gallery-charcoal shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] sm:block"
      >
        <Image src={accent.image} alt={accent.title} fill className="object-cover" sizes="96px" />
      </motion.div>

      {/* Small supporting tile — bottom-left, peeking behind primary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
        whileHover={{ scale: 1.06, transition: { duration: 0.3 } }}
        className="absolute -left-3 bottom-0 hidden h-20 w-28 rotate-[5deg] overflow-hidden rounded-xl border border-white/10 bg-gallery-charcoal shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] lg:block"
      >
        <Image src={supporting.image} alt={supporting.title} fill className="object-cover" sizes="112px" />
      </motion.div>
    </div>
  );
}
