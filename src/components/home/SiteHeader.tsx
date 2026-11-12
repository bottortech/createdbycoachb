"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import { CloseIcon, MenuIcon, PlayCircleIcon, ArrowRightIcon } from "./icons";

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Tech Stack", href: "#tech-stack" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "AI Predictions", href: "#ai-predictions" },
  { label: "Enterprise", href: "#enterprise" },
  { label: "Contact", href: "#contact" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        scrolled || menuOpen ? "border-white/[0.07] bg-gallery-black/85" : "border-transparent bg-gallery-black/40"
      }`}
    >
      <Container className="flex h-16 items-center justify-between gap-6 sm:h-18">
        <a href="#about" className="group flex items-center gap-3" aria-label="Created by Coach B — back to top">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gallery-accent/50 bg-gallery-accent/10 text-[13px] font-semibold tracking-wide text-gallery-accent transition-colors group-hover:bg-gallery-accent group-hover:text-gallery-black">
            CB
          </span>
          <span className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.32em] text-gallery-white">
            Created by <span className="text-gallery-accent">Coach B</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 xl:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[13px] text-gallery-light/70 transition-colors hover:text-gallery-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/gallery"
            className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-gallery-accent/45 bg-gallery-accent/10 px-4 py-2 text-[12px] font-medium tracking-wide text-gallery-accent transition-colors hover:bg-gallery-accent hover:text-gallery-black sm:inline-flex"
          >
            <PlayCircleIcon />
            Enter 3D Gallery
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gallery-white transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent xl:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div id="mobile-nav-panel" className="border-t border-white/[0.06] bg-gallery-black/95 xl:hidden">
          <Container className="grid gap-1 py-4 sm:grid-cols-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-[15px] text-gallery-light/85 transition-colors hover:bg-white/[0.04] hover:text-gallery-accent"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/gallery"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-full border border-gallery-accent/45 bg-gallery-accent/10 px-4 py-3 text-[14px] font-medium text-gallery-accent sm:col-span-2"
            >
              Enter 3D Gallery <ArrowRightIcon />
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
