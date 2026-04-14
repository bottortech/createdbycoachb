"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import GalleryButton from "../GalleryButton";
import FramedPiece from "../gallery/FramedPiece";
import ProjectModal, { Project } from "../gallery/ProjectModal";

const bookProject: Project = {
  title: "Professor WiggleWoo",
  category: "Featured Publication",
  image: "/images/book-cover.jpg",
  description:
    "A creative and imaginative story that brings wonder, learning, and fun to readers of all ages. Written with care, illustrated with purpose, and published with pride. This is more than a book. It is the beginning of a universe.",
  tags: ["Published", "Children's Literature", "Education"],
  link: "https://a.co/d/0di3W4os",
  linkLabel: "Buy on Amazon",
};

export default function AuthorExhibit() {
  const [open, setOpen] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  // Book lifts and rotates subtly as user passes through
  const bookY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -40]);
  const bookRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 4]);
  const bookScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);

  return (
    <>
      <GallerySection id="author-exhibit" spotlightGold>
        <SectionLabel
          label="The Library"
          title="Published Works"
          description="A reading room where the published work rests in its own light. Click the cover to step closer."
        />

        <div
          ref={sceneRef}
          className="grid gap-12 md:grid-cols-5 md:items-center md:gap-16"
        >
          {/* Book cover in portrait frame with parallax */}
          <motion.div
            style={{ y: bookY, rotate: bookRotate, scale: bookScale }}
            className="md:col-span-2"
          >
            <div className="mx-auto max-w-xs">
              <FramedPiece
                frameType="portrait"
                onClick={() => setOpen(true)}
                plaque={{
                  title: "Professor WiggleWoo",
                  subtitle: "Featured Publication",
                }}
              >
                <Image
                  src="/images/book-cover.jpg"
                  alt="Professor WiggleWoo book cover"
                  fill
                  sizes="(max-width: 768px) 60vw, 280px"
                  className="object-cover"
                />
              </FramedPiece>
            </div>
          </motion.div>

          {/* Book details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6 md:col-span-3"
          >
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-gallery-accent">
                Featured Publication
              </span>
              <h3 className="mt-3 text-3xl font-light text-gallery-white md:text-4xl">
                Professor WiggleWoo
              </h3>
              <p className="mt-1 text-sm text-gallery-muted">By Coach B</p>
            </div>

            <p className="text-gallery-muted leading-relaxed">
              A creative and imaginative story that brings wonder, learning,
              and fun to readers of all ages. This book represents the
              intersection of storytelling and education, designed to spark
              curiosity and make learning feel like an adventure.
            </p>

            <p className="text-gallery-muted leading-relaxed">
              Written with care, illustrated with purpose, and published
              with pride. This is more than a book. It is the beginning of
              a universe.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-gallery-accent-soft px-4 py-1.5 text-xs font-medium text-gallery-accent">
                Published
              </span>
              <span className="rounded-full bg-gallery-accent-soft px-4 py-1.5 text-xs font-medium text-gallery-accent">
                Children&apos;s Literature
              </span>
              <span className="rounded-full bg-gallery-accent-soft px-4 py-1.5 text-xs font-medium text-gallery-accent">
                Education
              </span>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <GalleryButton
                href="https://www.amazon.com/stores/Dr.-Keith/author/B0GG5S88ZZ?ccs_id=49e1ad18-4e78-4d13-9c3a-719ad5731083"
                variant="primary"
              >
                Read More
              </GalleryButton>
              <GalleryButton href="https://a.co/d/0di3W4os" variant="outline">
                Buy Now
              </GalleryButton>
            </div>
          </motion.div>
        </div>
      </GallerySection>

      <ProjectModal
        project={open ? bookProject : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
