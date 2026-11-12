"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/Container";
import { TESTIMONIALS, type Testimonial } from "@/data/testimonials";
import SectionHeader from "./SectionHeader";
import { ChevronDownIcon } from "./icons";

function initials(name: string) {
  const words = name.replace(/["“”]/g, "").split(/\s+/).filter(Boolean);
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
}

/** A testimonial that clamps long reviews and offers a toggle — but only
 *  when the text is actually clipped at the current width. */
function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);
  const ref = useRef<HTMLQuoteElement>(null);
  const bodyId = `testimonial-${t.id}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (expanded) return;
      setClipped(el.scrollHeight - el.clientHeight > 2);
    };
    measure();
    // A web-font swap reflows the text without resizing the clamped box, so
    // the ResizeObserver alone can miss it — re-measure once fonts are ready.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [expanded]);

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-gallery-charcoal p-6 sm:p-8">
      <span className="font-serif text-5xl leading-none text-gallery-accent/70" aria-hidden>
        &ldquo;
      </span>
      <blockquote
        ref={ref}
        id={bodyId}
        className={`mt-2 text-[15px] leading-relaxed text-gallery-light/85 sm:text-base ${expanded ? "" : "line-clamp-8 sm:line-clamp-6"}`}
      >
        {t.quote}
      </blockquote>
      {(clipped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="mt-3 inline-flex w-fit items-center gap-1.5 text-[14px] font-medium text-gallery-accent underline-offset-4 hover:underline"
        >
          {expanded ? "Show less" : "Read full review"}
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
      <figcaption className="mt-auto flex items-center gap-3 border-t border-white/[0.07] pt-5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gallery-accent/30 bg-gallery-accent/10 text-[13px] font-semibold text-gallery-accent"
          aria-hidden
        >
          {initials(t.name)}
        </span>
        <span className="min-w-0">
          <span className="block text-[15px] font-medium text-gallery-white">{t.name}</span>
          <span className="block text-[13px] text-gallery-muted">{t.title}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// Reads the same src/data/testimonials.ts as the 3D gallery's projector.
export default function TestimonialsGrid() {
  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeader
          id="testimonials-title"
          eyebrow="Client Reviews"
          title="What Clients Say"
          description="Feedback from the people who've worked directly with the process, start to finish."
        />
        {/* 2-up keeps any even count balanced; a trailing odd review spans the row. */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className={`h-full ${TESTIMONIALS.length % 2 === 1 && i === TESTIMONIALS.length - 1 ? "md:col-span-2" : ""}`}
            >
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
