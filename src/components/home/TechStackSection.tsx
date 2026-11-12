import Image from "next/image";
import Container from "@/components/Container";
import { SKILL_CATEGORIES, CHIP_IMAGES } from "@/data/skills";

// Standard-page counterpart to the 3D gallery's Tech Vault, reading the same
// src/data/skills.ts. The section intro occupies the first grid cell, so the
// seven categories plus the intro fill an even 4×2 (desktop) / 2×4 (tablet)
// grid instead of leaving a hole at the end.
export default function TechStackSection() {
  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-title"
      className="scroll-mt-20 border-t border-white/[0.06] bg-gallery-charcoal/40 py-20 sm:py-28"
    >
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          <div className="flex flex-col justify-end pb-2 sm:pr-4">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent">
              <span className="h-px w-8 bg-gallery-accent/60" aria-hidden />
              Tech Vault
            </p>
            <h2
              id="tech-title"
              className="text-3xl font-light leading-[1.1] tracking-tight text-gallery-white sm:text-4xl"
            >
              Tech Stack
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gallery-light/75">
              The tools and systems behind the work above, organized by domain.
            </p>
          </div>

          {SKILL_CATEGORIES.map((category, i) => (
            <div
              key={category.id}
              className="flex flex-col rounded-2xl border border-white/[0.07] bg-gallery-black/60 p-6 transition-colors hover:border-gallery-accent/30"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-light text-gallery-white">{category.title}</h3>
                <span className="text-[12px] tabular-nums text-gallery-muted">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-gallery-light/65">{category.tagline}</p>
              <ul className="mt-auto flex flex-wrap gap-2 pt-5">
                {category.chips.map((chip) => {
                  const icon = CHIP_IMAGES[chip];
                  return (
                    <li
                      key={chip}
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1.5 pl-2 pr-3 text-[13px] text-gallery-light/90"
                    >
                      {icon ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/90">
                          <Image src={icon} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
                        </span>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-gallery-accent" aria-hidden />
                      )}
                      {chip}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
