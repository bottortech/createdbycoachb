"use client";

import { useEffect, useState } from "react";

interface SiteFooterProps {
  className?: string;
}

/**
 * Small developer-credit footer for the standard document-flow pages
 * (/standard, /predictions). The 3D gallery route has its own full-screen UI
 * and intentionally does not use this.
 */
export default function SiteFooter({ className = "" }: SiteFooterProps) {
  // Avoids an SSR/CSR year mismatch on Dec 31 → Jan 1 — same pattern already
  // used for the copyright year on /standard.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const year = mounted ? new Date().getFullYear() : 2026;

  return (
    <footer className={`w-full border-t border-white/5 px-4 py-6 text-center ${className}`}>
      <p className="text-[12px] leading-relaxed text-gallery-muted">
        © {year} Created by Coach B — Designed &amp; Developed by{" "}
        <a
          href="https://bottortechnologies.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gallery-muted underline decoration-gallery-muted/30 underline-offset-2 transition-colors duration-200 hover:text-gallery-accent hover:decoration-gallery-accent/50"
        >
          Bottor Technologies Inc.
        </a>
      </p>
    </footer>
  );
}
