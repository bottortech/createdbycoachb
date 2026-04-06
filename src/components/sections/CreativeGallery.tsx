"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";

const galleryItems = [
  { title: "WiggleWoo Character", category: "Character Design", image: "/images/Wiggle-Woo-Character.png" },
  { title: "Carla's Creation", category: "Branding", image: "/images/carlas-creation.png" },
  { title: "JB TV", category: "Graphics", image: "/images/jb-tv.png" },
  { title: "By Any Means", category: "Logo", image: "/images/By-any-means-logo.png" },
  { title: "Lush Brows", category: "Logo", image: "/images/lush-brows-logo.png" },
  { title: "RetroRack", category: "Logo", image: "/images/retro-rack-logo.png" },
];

export default function CreativeGallery() {
  return (
    <GallerySection id="creative-gallery" spotlight>
      <SectionLabel
        label="Creative Gallery"
        title="Design Work"
        description="A curated selection of logos, graphics, brand assets, and visual systems. Each piece reflects a commitment to clean, purposeful design."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
        {galleryItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            className="group relative cursor-pointer"
          >
            {/* Gallery piece frame */}
            <div className="gallery-frame aspect-square overflow-hidden rounded-xl">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gallery-charcoal to-gallery-black">
                  <div className="text-center transition-transform duration-500 group-hover:scale-110">
                    <div className="mb-3 text-4xl text-gallery-accent/20 transition-colors duration-300 group-hover:text-gallery-accent/40">
                      &#10023;
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gallery-muted/40 group-hover:text-gallery-muted/70 transition-colors duration-300">
                      Add Image
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Hover overlay with info */}
            <div className="absolute inset-0 flex items-end rounded-xl bg-gradient-to-t from-gallery-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="p-4">
                <span className="text-[10px] font-medium uppercase tracking-widest text-gallery-accent">
                  {item.category}
                </span>
                <p className="mt-1 text-sm font-light text-gallery-white">
                  {item.title}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GallerySection>
  );
}
