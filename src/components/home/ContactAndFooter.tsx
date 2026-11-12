"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";
import { BOOKING_PAYMENT_URL, LINKEDIN_URL, GITHUB_URL } from "@/lib/links";
import { NAV_LINKS } from "./SiteHeader";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  PlayCircleIcon,
} from "./icons";

const CONTACT_EMAIL = "ceo@bottortechnologies.com";

function DirectLink({
  href,
  label,
  value,
  icon,
  external,
}: {
  href: string;
  label: string;
  value: string;
  icon: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gallery-black/50 p-4 transition-colors hover:border-gallery-accent/40"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gallery-accent/10 text-gallery-accent">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] uppercase tracking-[0.16em] text-gallery-muted">{label}</span>
        <span className="block truncate text-[15px] text-gallery-white transition-colors group-hover:text-gallery-accent">
          {value}
        </span>
      </span>
      <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-gallery-muted transition-colors group-hover:text-gallery-accent" />
    </a>
  );
}

// Contact and footer are styled as one continuous band (the contact gradient
// flows straight into the footer's surface) so the page ends on a single
// composed block rather than a form floating above a detached footer. They're
// separate exports only so the contact section can live inside <main>.
export function ContactSection() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-20 border-t border-white/[0.06] bg-gradient-to-b from-gallery-charcoal/80 to-gallery-charcoal/30 pb-16 pt-20 sm:pb-20 sm:pt-28"
    >
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-8">
          {/* Intro */}
          <div className="lg:col-span-5">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent">
              <span className="h-px w-8 bg-gallery-accent/60" aria-hidden />
              Contact
            </p>
            <h2
              id="contact-title"
              className="text-4xl font-light leading-[1.05] tracking-tight text-gallery-white sm:text-5xl"
            >
              Start a Project
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gallery-light/75 sm:text-[17px]">
              Available for web development, brand identity, AI tooling, and creative consulting. Fill out the form, or
              reach out directly.
            </p>
          </div>

          {/* Form — beside the intro on desktop, right after it on mobile */}
          <div className="lg:col-span-7 lg:row-span-2">
            <div className="rounded-3xl border border-white/[0.08] bg-gallery-charcoal p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:p-10">
              <h3 className="mb-6 text-xl font-light text-gallery-white">Tell me about your project</h3>
              <ContactForm size="comfortable" />
            </div>
          </div>

          {/* Direct options — under the intro on desktop, below the form on mobile */}
          <div className="lg:col-span-5 lg:self-end">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-gallery-light/80">
              Reach out directly
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <DirectLink href={`mailto:${CONTACT_EMAIL}`} label="Email" value={CONTACT_EMAIL} icon={<MailIcon />} />
              <DirectLink
                href={BOOKING_PAYMENT_URL}
                label="Calendar"
                value="Book a Call"
                icon={<CalendarIcon />}
                external
              />
              <DirectLink href={LINKEDIN_URL} label="LinkedIn" value="Byron Brown" icon={<LinkedInIcon />} external />
              <DirectLink href={GITHUB_URL} label="GitHub" value="Bottor Technologies" icon={<GitHubIcon />} external />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function HomeFooter({ year }: { year: number | null }) {
  return (
    <footer className="border-t border-white/[0.07] bg-gradient-to-b from-gallery-charcoal/30 to-gallery-black">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-start">
          <div>
            <a href="#about" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gallery-accent/50 bg-gallery-accent/10 text-[13px] font-semibold text-gallery-accent">
                CB
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-gallery-white">
                Created by <span className="text-gallery-accent">Coach B</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-gallery-muted">
              Builder. Designer. Founder. Author.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[14px] text-gallery-light/75 transition-colors hover:text-gallery-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/predictions"
                  className="text-[14px] text-gallery-light/75 transition-colors hover:text-gallery-accent"
                >
                  All Predictions
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-gallery-accent/45 bg-gallery-accent/10 px-5 py-2.5 text-[14px] font-medium text-gallery-accent transition-colors hover:bg-gallery-accent hover:text-gallery-black"
            >
              <PlayCircleIcon /> Enter 3D Gallery <ArrowRightIcon />
            </Link>
            <div className="flex items-center gap-2">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gallery-light/75 transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-gallery-light/75 transition-colors hover:border-gallery-accent/40 hover:text-gallery-accent"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 text-[13px] text-gallery-muted">
          © {year ?? 2026} Created by Coach B — Designed &amp; Developed by{" "}
          <a
            href="https://bottortechnologies.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gallery-light/80 underline decoration-white/25 underline-offset-2 transition-colors hover:text-gallery-accent hover:decoration-gallery-accent/50"
          >
            Bottor Technologies Inc.
          </a>
        </div>
      </Container>
    </footer>
  );
}
