"use client";

import { motion } from "framer-motion";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";

const roles = [
  {
    title: "Builder",
    description:
      "Creating software, tools, and digital products from concept to launch.",
  },
  {
    title: "Creative Technologist",
    description:
      "Blending design, code, and emerging tech to build unique experiences.",
  },
  {
    title: "Product Creator",
    description:
      "Shipping real products that solve real problems for real people.",
  },
  {
    title: "Founder",
    description:
      "Leading Bottor Technologies Inc. and building ventures from the ground up.",
  },
  {
    title: "Author",
    description:
      "Writing stories that inspire imagination and make learning feel alive.",
  },
];

export default function Studio() {
  return (
    <GallerySection id="studio" spotlightGold>
      <SectionLabel
        label="Studio"
        title="About Coach B"
        description="A multidisciplinary creator who builds at the intersection of technology, design, business, and art."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group gallery-frame rounded-xl p-6 transition-all duration-300"
          >
            <h4 className="text-lg font-light text-gallery-white group-hover:text-gallery-accent transition-colors duration-300">
              {role.title}
            </h4>
            <p className="mt-2 text-sm text-gallery-muted leading-relaxed">
              {role.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <p className="mx-auto max-w-2xl text-gallery-muted leading-relaxed">
          Every project, product, and piece of work in this gallery reflects a
          commitment to quality, creativity, and forward thinking. The goal is
          simple: build things that matter, design experiences that resonate, and
          create a body of work that speaks for itself.
        </p>
      </motion.div>
    </GallerySection>
  );
}
