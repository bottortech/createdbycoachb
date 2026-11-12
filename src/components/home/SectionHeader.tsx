import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  /** Supporting copy. On wide screens it sits beside the title so the header
   *  uses the full row instead of stacking down the left edge. */
  description?: ReactNode;
  /** Optional trailing element (a link or button) aligned with the copy. */
  action?: ReactNode;
  /** Stack copy under the title even on desktop (for narrow columns). */
  stacked?: boolean;
  id?: string;
}

export default function SectionHeader({ eyebrow, title, description, action, stacked, id }: SectionHeaderProps) {
  return (
    <div
      className={`mb-10 sm:mb-14 ${
        stacked ? "" : "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16"
      }`}
    >
      <div>
        <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent">
          <span className="h-px w-8 bg-gallery-accent/60" aria-hidden />
          {eyebrow}
        </p>
        <h2
          id={id}
          className="text-3xl font-light leading-[1.1] tracking-tight text-gallery-white sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>
      </div>
      {(description || action) && (
        <div className={`mt-5 ${stacked ? "" : "lg:mt-0"}`}>
          {description && (
            <p className="max-w-xl text-base leading-relaxed text-gallery-light/75 sm:text-[17px]">{description}</p>
          )}
          {action && <div className="mt-5">{action}</div>}
        </div>
      )}
    </div>
  );
}
