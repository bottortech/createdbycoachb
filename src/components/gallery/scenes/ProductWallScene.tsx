"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FramedPiece from "../FramedPiece";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const products: Project[] = [
  {
    title: "RetroRack.app",
    category: "Web Application",
    image: "/images/retrorack-web-app.png",
    description:
      "A web based platform for collecting, organizing, and showcasing retro tech. Built for enthusiasts who appreciate the beauty of vintage hardware and want a clean way to catalog their collection.",
    tags: ["Web App", "React", "Full Stack"],
    link: "https://retrorack.app/",
    linkLabel: "Visit RetroRack",
  },
  {
    title: "RetroRack Extension",
    category: "Chrome Extension",
    image: "/images/retrorack-extension.jpg",
    description:
      "The companion browser extension for RetroRack. Clip retro finds from anywhere on the web, save references, and add items to your collection without leaving the page.",
    tags: ["Chrome Extension", "Browser Tool"],
    link: "https://chromewebstore.google.com/detail/dmofdijhloefhkhheimljfjchccgnhgf?utm_source=item-share-cb",
    linkLabel: "Get the Extension",
  },
  {
    title: "Bottor Assist",
    category: "AI Powered Tool",
    image: "/images/bottor-assist.png",
    description:
      "An intelligent assistant platform designed to streamline workflows, automate repetitive tasks, and bring AI capabilities into everyday business operations with a clean, intuitive interface.",
    tags: ["AI", "Automation", "Productivity"],
    link: "https://bottor-assist-xxxxx.lovable.app/",
    linkLabel: "Explore Bottor Assist",
  },
];

export default function ProductWallScene({ onSelectProject }: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Product Wing
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Active Products
        </h2>
      </motion.div>

      {/* Three landscape frames side by side */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {products.map((product, i) => (
          <motion.div
            key={product.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.12 }}
          >
            <FramedPiece
              frameType="landscape"
              onClick={() => onSelectProject(product)}
              plaque={{ title: product.title, subtitle: product.category }}
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                className="object-cover scale-110"
              />
            </FramedPiece>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
