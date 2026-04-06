"use client";

import { motion } from "framer-motion";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";
import ExhibitCard from "../ExhibitCard";
import GalleryButton from "../GalleryButton";

const releases = [
  { title: "Featured Release", type: "Single / EP / Album", year: "2024" },
  { title: "Second Release", type: "Single", year: "2024" },
  { title: "Third Release", type: "Single", year: "2023" },
];

const musicVideos = [
  {
    title: "Featured Music Video",
    description: "Official visual for the lead single",
  },
  {
    title: "Second Visual",
    description: "A cinematic companion piece",
  },
  {
    title: "Live Performance",
    description: "Captured live in the studio",
  },
  {
    title: "Visualizer",
    description: "Animated visual experience",
  },
];

export default function MusicRoom() {
  return (
    <GallerySection id="music-room" spotlight>
      <SectionLabel
        label="Music Room"
        title="Sound & Vision"
        description="Original music crafted with intention. Each release is a creative expression that blends sound, emotion, and artistry."
      />

      {/* Artist identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 flex items-center gap-6"
      >
        <div className="gallery-frame h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gallery-charcoal to-gallery-black">
            <span className="text-2xl text-gallery-accent/40">&#9835;</span>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-light text-gallery-white">Coach B</h3>
          <p className="text-sm text-gallery-muted">
            Artist. Producer. Creator.
          </p>
          <div className="mt-2 flex gap-3">
            <GalleryButton href="#" variant="outline">
              Spotify
            </GalleryButton>
            <GalleryButton href="#" variant="outline">
              Apple Music
            </GalleryButton>
          </div>
        </div>
      </motion.div>

      {/* Music releases */}
      <div className="grid gap-6 md:grid-cols-3">
        {releases.map((release, i) => (
          <ExhibitCard key={release.title} delay={i * 0.1}>
            {/* Cover art placeholder */}
            <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-gallery-charcoal to-gallery-black">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-4xl text-gallery-accent/20">&#9835;</div>
                  <p className="text-[10px] uppercase tracking-widest text-gallery-muted/40">
                    Cover Art
                  </p>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">
              {release.type} &middot; {release.year}
            </span>
            <h4 className="mt-2 text-lg font-light text-gallery-white">
              {release.title}
            </h4>

            {/* Embedded player placeholder */}
            <div className="mt-4 rounded-lg bg-gallery-dark/50 p-3">
              <div className="flex items-center gap-3">
                <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gallery-accent text-gallery-black text-xs">
                  &#9654;
                </button>
                <div className="flex-1">
                  <div className="h-1 overflow-hidden rounded-full bg-gallery-gray">
                    <div className="h-full w-1/3 rounded-full bg-gallery-accent/50" />
                  </div>
                </div>
                <span className="text-[10px] text-gallery-muted">0:00</span>
              </div>
            </div>

            <div className="mt-4">
              <GalleryButton href="#" variant="outline">
                Listen
              </GalleryButton>
            </div>
          </ExhibitCard>
        ))}
      </div>

      {/* Music Videos Sub-section */}
      <div className="mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <span className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.3em] text-gallery-accent">
            Music Videos
          </span>
          <h3 className="text-2xl font-light tracking-tight text-gallery-white md:text-4xl">
            Visual Collection
          </h3>
          <p className="mt-3 max-w-xl text-gallery-muted">
            Cinematic visuals and performances that bring the music to life.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {musicVideos.map((video, i) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="gallery-frame group overflow-hidden rounded-2xl transition-all duration-300"
            >
              {/* Video thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gallery-charcoal to-gallery-black">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-3xl text-gallery-accent/20">&#9654;</div>
                    <p className="text-[10px] uppercase tracking-widest text-gallery-muted/40">
                      Thumbnail
                    </p>
                  </div>
                </div>

                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-gallery-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gallery-accent/90 shadow-lg shadow-gallery-accent/20">
                    <svg
                      className="ml-1 h-6 w-6 text-gallery-black"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Video info */}
              <div className="p-5">
                <h4 className="text-sm font-medium text-gallery-white group-hover:text-gallery-accent transition-colors duration-300">
                  {video.title}
                </h4>
                <p className="mt-1 text-xs text-gallery-muted">
                  {video.description}
                </p>
                <div className="mt-4">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-gallery-accent/70 transition-colors duration-300 hover:text-gallery-accent"
                  >
                    Watch
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GallerySection>
  );
}
