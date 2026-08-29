"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getPublishedPredictions } from "@/data/predictions";
import { PROJECTS } from "@/data/projects";
import Container from "@/components/Container";
import { BOOKING_PAYMENT_URL } from "@/lib/links";
import PredictionStatusBadge from "@/components/PredictionStatusBadge";
import CertificationBadges from "@/components/CertificationBadges";

function ArrowIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function nextPredictionLabel(published: ReturnType<typeof getPublishedPredictions>): string {
  const nums = published
    .map((p) => parseInt(p.number.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  const next = String(max + 1).padStart(3, "0");
  const after = String(max + 2).padStart(3, "0");
  return `AI Prediction #${next}, #${after}...`;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const published = getPublishedPredictions();

  return (
    <>
      {/* Override the global overflow:hidden so this page scrolls normally */}
      <style>{`
        body { overflow: auto !important; height: auto !important; }
      `}</style>

      <div
        className="bg-gallery-black text-gallery-white min-h-screen"
        style={{ overflowY: "auto", overflowX: "hidden" }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 z-0" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%)",
        }} />

        {/* ── Navigation ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-gallery-black/90 backdrop-blur-md">
          <Container className="py-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.42em] text-gallery-accent">
              Created by Coach B
            </span>
            <nav className="hidden sm:flex items-center gap-8">
              {["About", "Projects", "AI Predictions", "Contact"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-[10px] font-medium uppercase tracking-[0.22em] text-gallery-muted hover:text-gallery-accent transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
            <Link
              href="/gallery"
              className="flex items-center gap-2 rounded-full border border-gallery-accent/40 bg-gallery-accent/10 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent transition-all hover:bg-gallery-accent hover:text-gallery-black"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.328l5.603 3.113z" />
              </svg>
              Enter 3D Gallery
            </Link>
          </Container>
        </header>

        <main className="relative z-10">

          {/* ── Hero / About ── */}
          <section id="about">
            <Container className="pt-24 pb-24 border-b border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-gallery-accent mb-6">
                Portfolio
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gallery-white mb-7 leading-[1.15] tracking-tight max-w-2xl">
                Created by Coach B
              </h1>
              <p className="text-gallery-muted text-lg leading-relaxed max-w-xl mb-5">
                Builder. Designer. Founder. Author. Creating products, systems, and experiences
                that solve real problems and push ideas forward.
              </p>
              <p className="text-gallery-muted/70 text-[13px] leading-relaxed max-w-xl mb-10">
                Created by Coach B is the web development portfolio of Bottor Technologies Inc.,
                showcasing custom websites, web applications, and digital solutions built for
                businesses and organizations.
              </p>
              <div className="flex flex-wrap gap-2.5 mb-14">
                {["Web Apps", "AI Tools", "Brand Identity", "Loyalty Cards", "Games", "Books", "Chrome Extensions"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gallery-accent-soft border border-gallery-accent/20 px-4 py-1.5 text-[11px] font-medium text-gallery-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="max-w-lg mb-14">
                <CertificationBadges />
              </div>

              {/* 3D Gallery CTA card */}
              <div className="flex items-start gap-5 rounded-2xl border border-gallery-accent/20 bg-gallery-accent-soft p-6 max-w-lg">
                <div className="mt-0.5 h-9 w-9 rounded-full bg-gallery-accent/20 flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-gallery-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.328l5.603 3.113z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gallery-white text-sm font-medium mb-1.5">
                    Experience the 3D Gallery
                  </p>
                  <p className="text-gallery-muted text-[12px] leading-relaxed mb-4">
                    The full portfolio lives inside an immersive 3D gallery. Walk through the space,
                    discover hidden rooms, and explore work as a curated exhibit.
                  </p>
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 text-[11px] font-medium text-gallery-accent hover:underline"
                  >
                    Enter the Gallery <ArrowIcon />
                  </Link>
                </div>
              </div>
            </Container>
          </section>

          {/* ── Projects ── */}
          <section id="projects">
            <Container className="pt-24 pb-24 border-b border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-gallery-accent mb-4">
                Work
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-gallery-white mb-3 tracking-tight">
                Selected Projects
              </h2>
              <p className="text-gallery-muted leading-relaxed max-w-xl mb-14">
                A cross-section of products, systems, and creative work built from scratch.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {PROJECTS.map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 overflow-hidden hover:border-gallery-accent/20 transition-all duration-300"
                  >
                    <div className="relative h-48 w-full bg-gallery-dark overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gallery-charcoal/70 to-transparent" />
                    </div>
                    <div className="p-6">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-gallery-accent">
                        {project.category}
                      </span>
                      <h3 className="mt-2 text-base font-light text-gallery-white leading-snug">
                        {project.title}
                      </h3>
                      <p className="mt-2.5 text-[12px] text-gallery-muted leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(project.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gallery-accent-soft px-2.5 py-0.5 text-[9px] font-medium text-gallery-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {"link" in project && project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-medium text-gallery-accent hover:underline"
                        >
                          {project.linkLabel ?? "View Project"} <ArrowIcon />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* ── AI Predictions ── */}
          <section id="ai-predictions">
            <Container className="pt-24 pb-24 border-b border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-gallery-accent mb-4">
                AI Predictions Wing
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-gallery-white mb-3 tracking-tight">
                AI Predictions
              </h2>
              <p className="text-gallery-muted leading-relaxed max-w-xl mb-14">
                Future-focused essays, frameworks, and predictions about AI, creativity, business,
                technology, and society. Each entry is a documented view of where things are heading — and why.
              </p>
              <div className="space-y-4 max-w-2xl">
                {published.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/predictions/${p.slug}`}
                    className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 p-6 hover:border-gallery-accent/20 transition-all duration-300"
                  >
                    <div className="shrink-0 h-12 w-12 rounded-xl border border-gallery-accent/30 bg-gallery-accent-soft flex items-center justify-center">
                      <span className="text-[9px] font-bold text-gallery-accent tracking-wider">{p.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-gallery-accent">
                          {p.category}
                        </p>
                        <PredictionStatusBadge status={p.status} />
                      </div>
                      <h3 className="text-base font-light text-gallery-white group-hover:text-gallery-accent transition-colors leading-snug">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-[12px] text-gallery-muted leading-relaxed line-clamp-2">
                        {p.coreIdea}
                      </p>
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {p.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-gallery-accent-soft px-2.5 py-0.5 text-[9px] font-medium text-gallery-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-[10px] text-gallery-muted/60">
                        Published {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        {p.lastUpdated && p.lastUpdated !== p.date && (
                          <> · Updated {new Date(p.lastUpdated + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
                <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 text-center">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-gallery-muted">More predictions in progress</p>
                  <p className="mt-1.5 text-[11px] text-gallery-muted/50">{nextPredictionLabel(published)}</p>
                </div>
              </div>
              <div className="mt-10">
                <Link
                  href="/predictions"
                  className="inline-flex items-center gap-2 text-[11px] font-medium text-gallery-accent hover:underline"
                >
                  View all AI Predictions <ArrowIcon />
                </Link>
              </div>
            </Container>
          </section>

          {/* ── Contact ── */}
          <section id="contact">
            <Container className="pt-24 pb-32">
              <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-gallery-accent mb-4">
                Contact
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-gallery-white mb-3 tracking-tight">
                Start a Project
              </h2>
              <p className="text-gallery-muted leading-relaxed max-w-xl mb-14">
                Available for web development, brand identity, AI tooling, and creative
                consulting. Get in touch to discuss your project.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                <a
                  href="mailto:hello@createdbycoachb.com"
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 p-5 hover:border-gallery-accent/20 transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-gallery-accent-soft flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-gallery-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-gallery-muted mb-0.5">Email</p>
                    <p className="text-sm text-gallery-white group-hover:text-gallery-accent transition-colors">Send a Message</p>
                  </div>
                </a>
                <a
                  href={BOOKING_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 p-5 hover:border-gallery-accent/20 transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-gallery-accent-soft flex items-center justify-center shrink-0">
                    <svg className="h-4 w-4 text-gallery-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-gallery-muted mb-0.5">Calendar</p>
                    <p className="text-sm text-gallery-white group-hover:text-gallery-accent transition-colors">Book a Call</p>
                  </div>
                </a>
              </div>
            </Container>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="relative z-10 border-t border-white/5">
          <Container className="py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[12px] text-gallery-muted text-center sm:text-left">
              © {mounted ? new Date().getFullYear() : "2026"} Created by Coach B — Designed &amp; Developed by{" "}
              <a
                href="https://bottortechnologies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gallery-muted underline decoration-gallery-muted/30 underline-offset-2 transition-colors duration-200 hover:text-gallery-accent hover:decoration-gallery-accent/50"
              >
                Bottor Technologies Inc.
              </a>
            </span>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-gallery-accent/40 px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent transition-all hover:bg-gallery-accent hover:text-gallery-black"
            >
              Enter 3D Gallery <ArrowIcon />
            </Link>
          </Container>
        </footer>
      </div>
    </>
  );
}
