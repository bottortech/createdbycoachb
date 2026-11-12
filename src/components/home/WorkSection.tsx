"use client";

import Image from "next/image";
import Container from "@/components/Container";
import type { ProjectEntry } from "@/data/projects";
import SectionHeader from "./SectionHeader";
import { ArrowUpRightIcon } from "./icons";

interface WorkSectionProps {
  projects: ProjectEntry[];
  onSelect: (project: ProjectEntry) => void;
}

/** Frames a project image. "cover" fills the frame; "contain" shows the whole
 *  piece (logos, characters, portrait artwork) over a blurred, dimmed copy of
 *  itself so nothing is cropped and the frame still feels full. */
function ProjectImage({
  project,
  aspect,
  sizes,
  priority,
}: {
  project: ProjectEntry;
  aspect: string;
  sizes: string;
  priority?: boolean;
}) {
  const contain = project.imageFit === "contain";
  return (
    <div className={`relative w-full overflow-hidden bg-gallery-dark ${aspect}`}>
      {contain && (
        <Image
          src={project.image}
          alt=""
          aria-hidden
          fill
          sizes="64px"
          className="scale-125 object-cover opacity-40 blur-2xl"
        />
      )}
      <Image
        src={project.image}
        alt={`${project.title} — ${project.category}`}
        fill
        priority={priority}
        sizes={sizes}
        className={`transition-transform duration-700 group-hover:scale-[1.03] ${
          contain ? "object-contain p-4 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)] sm:p-5" : "object-cover object-top"
        }`}
      />
      {project.status && (
        <span className="absolute left-3 top-3 rounded-full bg-gallery-black/85 px-3 py-1 text-[11px] font-medium tracking-wide text-gallery-accent ring-1 ring-gallery-accent/40 backdrop-blur-sm">
          {project.status}
        </span>
      )}
    </div>
  );
}

/** One card style, three densities. The whole card opens the details modal
 *  (via the title button's stretched hit area); the external link sits above
 *  that hit area so it stays independently clickable. */
function ProjectCard({
  project,
  onSelect,
  density,
}: {
  project: ProjectEntry;
  onSelect: (p: ProjectEntry) => void;
  density: "featured" | "standard" | "compact";
}) {
  const featured = density === "featured";
  const compact = density === "compact";
  const aspect = featured ? "aspect-[16/10]" : compact ? "aspect-[4/3]" : "aspect-[16/10]";
  const sizes = featured
    ? "(max-width: 1024px) 100vw, 50vw"
    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";
  const tags = (project.tags ?? []).slice(0, featured ? 4 : 3);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gallery-charcoal transition-colors duration-300 hover:border-gallery-accent/40 focus-within:border-gallery-accent/60">
      <ProjectImage project={project} aspect={aspect} sizes={sizes} priority={featured} />

      <div className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8" : compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gallery-accent">{project.category}</p>
        <h3
          className={`mt-2 font-light leading-snug text-gallery-white ${
            featured ? "text-2xl sm:text-3xl" : compact ? "text-[17px]" : "text-xl"
          }`}
        >
          <button
            type="button"
            onClick={() => onSelect(project)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            aria-label={`${project.title} — view details`}
          >
            {project.title}
          </button>
        </h3>
        <p
          className={`mt-3 leading-relaxed text-gallery-light/70 ${
            featured ? "max-w-xl text-[15px] sm:text-base" : "text-[14px]"
          } ${featured ? "" : compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {project.description}
        </p>

        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
            {tags.map((tag) => (
              <li key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] text-gallery-light/75">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className={`mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 ${compact ? "pt-4" : "pt-6"}`}>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1.5 text-[14px] font-medium text-gallery-accent underline-offset-4 hover:underline"
            >
              {project.linkLabel ?? "View Project"} <ArrowUpRightIcon />
            </a>
          )}
          <span className="text-[13px] text-gallery-muted transition-colors group-hover:text-gallery-light" aria-hidden>
            View details
          </span>
        </div>
      </div>
    </article>
  );
}

function GroupLabel({ children, count }: { children: string; count: number }) {
  return (
    <div className="mb-5 flex items-center gap-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-gallery-light">{children}</h3>
      <span className="text-[13px] text-gallery-muted">{String(count).padStart(2, "0")}</span>
      <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
    </div>
  );
}

export default function WorkSection({ projects, onSelect }: WorkSectionProps) {
  const featured = projects.filter((p) => p.showcaseSize === "featured");
  const standard = projects.filter((p) => (p.showcaseSize ?? "standard") === "standard");
  const compact = projects.filter((p) => p.showcaseSize === "compact");

  return (
    <section id="projects" aria-labelledby="work-title" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <SectionHeader
          id="work-title"
          eyebrow="Work"
          title="Selected Projects"
          description="A cross-section of products, systems, and creative work built from scratch. Select any project for the full story."
        />

        <div className="space-y-16 sm:space-y-20">
          {featured.length > 0 && (
            <div>
              <GroupLabel count={featured.length}>Flagship products</GroupLabel>
              <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                {featured.map((p) => (
                  <ProjectCard key={p.id} project={p} onSelect={onSelect} density="featured" />
                ))}
              </div>
            </div>
          )}

          {standard.length > 0 && (
            <div>
              <GroupLabel count={standard.length}>Apps, tools, books &amp; sites</GroupLabel>
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
                {standard.map((p) => (
                  <ProjectCard key={p.id} project={p} onSelect={onSelect} density="standard" />
                ))}
              </div>
            </div>
          )}

          {compact.length > 0 && (
            <div>
              <GroupLabel count={compact.length}>Brand &amp; design studio</GroupLabel>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {compact.map((p) => (
                  <ProjectCard key={p.id} project={p} onSelect={onSelect} density="compact" />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
