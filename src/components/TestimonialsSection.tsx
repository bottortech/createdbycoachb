import { TESTIMONIALS } from "@/data/testimonials";

// Standard-page counterpart to the 3D gallery's Client Reviews projector
// (src/components/sections/TestimonialProjector.tsx) — both read from the
// same src/data/testimonials.ts so a new review only needs adding once.
export default function TestimonialsSection() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <div
          key={t.id}
          className="flex flex-col rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 p-6"
        >
          <div className="mb-3 text-3xl font-serif leading-none text-gallery-accent/50" aria-hidden="true">
            &ldquo;
          </div>
          <p className="flex-1 text-[13px] leading-relaxed text-gallery-muted line-clamp-6">
            {t.quote}
          </p>
          <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gallery-accent-soft text-[11px] font-semibold text-gallery-accent">
              {t.name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[12px] font-medium text-gallery-white">{t.name}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gallery-muted">{t.title}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
