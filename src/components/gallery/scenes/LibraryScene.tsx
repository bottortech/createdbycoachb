"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FramedPiece from "../FramedPiece";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const book: Project = {
  title: "Professor WiggleWoo",
  category: "Featured Publication",
  image: "/images/book-cover.jpg",
  description:
    "A creative and imaginative story that brings wonder, learning, and fun to readers of all ages. Written with care, illustrated with purpose, and published with pride. This is more than a book. It is the beginning of a universe.",
  tags: ["Published", "Children's Literature", "Education"],
  link: "https://a.co/d/0di3W4os",
  linkLabel: "Buy on Amazon",
};

export default function LibraryScene({ onSelectProject }: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          The Library
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Published Works
        </h2>
      </motion.div>

      <div className="flex items-center gap-10 md:gap-16">
        {/* Centered portrait frame */}
        <div className="w-56 flex-shrink-0 md:w-72">
          <FramedPiece
            frameType="portrait"
            onClick={() => onSelectProject(book)}
            plaque={{ title: "Professor WiggleWoo", subtitle: "By Coach B" }}
          >
            <Image
              src="/images/book-cover.jpg"
              alt="Professor WiggleWoo book cover"
              fill
              sizes="(max-width: 768px) 50vw, 288px"
              className="object-cover"
            />
          </FramedPiece>
        </div>

        {/* Book info beside the frame */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden max-w-sm space-y-4 md:block"
        >
          <p
            className="text-gallery-light/80 leading-relaxed"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
          >
            A creative and imaginative story that brings wonder, learning,
            and fun to readers of all ages. This book represents the
            intersection of storytelling and education.
          </p>
          <div className="flex flex-wrap gap-2">
            {book.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gallery-accent-soft px-3 py-1 text-[10px] font-medium text-gallery-accent"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <a
              href="https://www.amazon.com/stores/Dr.-Keith/author/B0GG5S88ZZ?ccs_id=49e1ad18-4e78-4d13-9c3a-719ad5731083"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gallery-accent px-5 py-2.5 text-xs font-medium text-gallery-black transition-all hover:bg-gallery-accent/90"
            >
              Read More
            </a>
            <a
              href="https://a.co/d/0di3W4os"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gallery-gray px-5 py-2.5 text-xs font-medium text-gallery-light transition-all hover:border-gallery-accent hover:text-gallery-accent"
            >
              Buy Now
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
