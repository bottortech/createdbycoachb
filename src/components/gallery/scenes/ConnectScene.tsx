"use client";

import { motion } from "framer-motion";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

const socials = [
  {
    platform: "LinkedIn",
    handle: "Byron Brown",
    url: "https://www.linkedin.com/in/byron-brown-b61ab695/",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    platform: "GitHub",
    handle: "Bottor Technologies",
    url: "https://github.com/bottortech",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

export default function ConnectScene(_props: Props) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Connect
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Stay Connected
        </h2>
      </motion.div>

      <div className="mx-auto flex max-w-sm flex-col gap-4">
        {socials.map((social, i) => (
          <motion.a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-gallery-accent/20"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-black/30 text-gallery-muted transition-colors duration-300 group-hover:bg-gallery-accent-soft group-hover:text-gallery-accent">
              {social.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gallery-white">{social.platform}</p>
              <p className="text-xs text-gallery-muted">{social.handle}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-[10px] tracking-wide text-gallery-muted/40">
          &copy; {new Date().getFullYear()} Coach B. All rights reserved.
        </p>
        <p className="mt-1 text-[9px] text-gallery-muted/25">
          Designed and built by Coach B
        </p>
      </motion.div>
    </div>
  );
}
