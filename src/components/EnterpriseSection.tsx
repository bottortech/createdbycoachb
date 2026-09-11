import { ENTERPRISE_DESCRIPTION, ENTERPRISE_SERVICES } from "@/data/enterprise";
import { ENTERPRISE_PDF_URL } from "@/lib/links";

function ArrowIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

// Standard-page counterpart to the 3D gallery's Enterprise Hall panel,
// reading from the shared src/data/enterprise.ts so the two never drift.
export default function EnterpriseSection() {
  return (
    <div className="max-w-2xl">
      <p className="text-gallery-muted leading-relaxed mb-8">{ENTERPRISE_DESCRIPTION}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {ENTERPRISE_SERVICES.map((service) => (
          <div
            key={service}
            className="rounded-xl border border-white/[0.06] bg-gallery-charcoal/40 px-4 py-3.5"
          >
            <p className="text-[13px] font-medium text-gallery-white">{service}</p>
          </div>
        ))}
      </div>
      <a
        href={ENTERPRISE_PDF_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-gallery-accent/40 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gallery-accent transition-all hover:bg-gallery-accent hover:text-gallery-black"
      >
        Download PDF <ArrowIcon />
      </a>
    </div>
  );
}
