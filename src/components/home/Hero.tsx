"use client";

import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import { PROJECTS } from "@/data/projects";
import { CERTIFICATIONS } from "@/data/certifications";
import { ArrowRightIcon, PlayCircleIcon } from "./icons";

const DISCIPLINES = ["Web Apps", "AI Tools", "Brand Identity", "Loyalty Cards", "Games", "Books", "Chrome Extensions"];

interface HeroProps {
  predictionCount: number;
}

/** The hero's single visual: a framed look into the immersive 3D gallery.
 *  It deliberately shows no project artwork, so the Work section is where the
 *  projects are introduced. Caption sits below the image for legibility. */
function GalleryPreview() {
  return (
    <Link
      href="/gallery"
      aria-labelledby="hero-gallery-title"
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-gallery-accent/25 bg-gallery-charcoal transition-colors duration-300 hover:border-gallery-accent/60 focus-visible:border-gallery-accent focus-visible:outline-none"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-gallery-dark">
        <Image
          src="/images/gallery/hero-interior.png"
          alt="Inside the Created by Coach B 3D gallery: a dark hall of gold-framed work under track lighting"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 46vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-gallery-black/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent ring-1 ring-gallery-accent/40 backdrop-blur-sm">
          <PlayCircleIcon /> Interactive
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gallery-accent">
            The Immersive Gallery
          </p>
          <p id="hero-gallery-title" className="mt-1.5 text-lg font-light leading-snug text-gallery-white sm:text-xl">
            Experience the 3D Gallery
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-gallery-light/70">
            Walk through the space, discover hidden rooms, and explore the work as a curated exhibit.
          </p>
        </div>
        <span
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gallery-accent/40 text-gallery-accent transition-colors group-hover:bg-gallery-accent group-hover:text-gallery-black sm:flex"
          aria-hidden
        >
          <ArrowRightIcon />
        </span>
      </div>
    </Link>
  );
}

export default function Hero({ predictionCount }: HeroProps) {
  const stats = [
    { value: PROJECTS.length, label: "Portfolio pieces" },
    { value: CERTIFICATIONS.length, label: "Certifications" },
    { value: predictionCount, label: "AI predictions published" },
  ];

  return (
    <section id="about" aria-labelledby="hero-title" className="relative scroll-mt-20 overflow-x-clip">
      {/* Ambient gold glow, contained to the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 78% 30%, rgba(201,168,76,0.10) 0%, transparent 70%), radial-gradient(40% 40% at 10% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />
      <Container className="relative pb-16 pt-12 sm:pb-24 sm:pt-20 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
          {/* Copy — always first, on every screen size */}
          <div>
            <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent">
              <span className="h-px w-8 bg-gallery-accent/60" aria-hidden />
              Portfolio · Bottor Technologies Inc.
            </p>
            <h1
              id="hero-title"
              className="text-[2.75rem] font-light leading-[1.02] tracking-tight text-gallery-white sm:text-6xl lg:text-[4.25rem] xl:text-7xl"
            >
              Created by <span className="whitespace-nowrap text-gallery-accent">Coach B</span>
            </h1>
            <p className="mt-6 text-lg font-medium text-gallery-white sm:text-xl">
              Builder. Designer. Founder. Author.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-gallery-light/75 sm:text-[17px]">
              Creating products, systems, and experiences that solve real problems and push ideas forward. Created by
              Coach B is the web development portfolio of Bottor Technologies Inc., showcasing custom websites, web
              applications, and digital solutions built for businesses and organizations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-gallery-accent px-6 py-3 text-[15px] font-medium text-gallery-black transition-colors hover:bg-[#d9b95c]"
              >
                View selected work <ArrowRightIcon />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[15px] font-medium text-gallery-white transition-colors hover:border-gallery-accent/50 hover:text-gallery-accent"
              >
                Start a project
              </a>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-2 py-3 text-[15px] font-medium text-gallery-accent underline-offset-4 hover:underline"
              >
                <PlayCircleIcon /> Enter 3D Gallery
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="What I build">
              {DISCIPLINES.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-gallery-accent/25 bg-gallery-accent/[0.08] px-3.5 py-1.5 text-[13px] text-gallery-accent"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/[0.08] pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-3xl font-light text-gallery-white sm:text-4xl">{s.value}</dd>
                  <dd className="mt-1 text-[12px] leading-snug text-gallery-muted sm:text-[13px]">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* One focused visual — a window into the 3D gallery */}
          <GalleryPreview />
        </div>
      </Container>
    </section>
  );
}
