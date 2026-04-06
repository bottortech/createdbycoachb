"use client";

import { motion } from "framer-motion";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import GalleryButton from "../GalleryButton";

const callOptions = [
  {
    duration: "30 Minutes",
    price: "$75",
    description:
      "A focused session for quick strategy, feedback, or guidance on a specific question or challenge.",
    bookingLink: "https://calendly.com/byron-brown31/30min",
  },
];

export default function BookCall() {
  return (
    <GallerySection id="book-a-call" spotlightGold>
      <SectionLabel
        label="Book a Call"
        title="Book a 1:1 with Coach B"
        description="For product strategy, creative direction, business discussion, and project guidance."
      />

      <div className="mx-auto grid max-w-md gap-6">
        {callOptions.map((option, i) => (
          <motion.div
            key={option.duration}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="gallery-frame rounded-2xl p-8 md:p-10 transition-all duration-300"
          >
            {/* Duration badge */}
            <span className="inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
              {option.duration}
            </span>

            {/* Price */}
            <div className="mt-4 mb-6">
              <span className="text-4xl font-extralight text-gallery-white">
                {option.price}
              </span>
              <span className="ml-2 text-sm text-gallery-muted/60">
                per session
              </span>
            </div>

            {/* Description */}
            <p className="mb-8 text-sm leading-relaxed text-gallery-muted">
              {option.description}
            </p>

            {/* Booking button */}
            <GalleryButton href={option.bookingLink} variant="primary">
              Book {option.duration}
            </GalleryButton>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center text-xs text-gallery-muted/50"
      >
        Sessions are conducted via video call. You will receive a confirmation and calendar invite after booking.
      </motion.p>
    </GallerySection>
  );
}
