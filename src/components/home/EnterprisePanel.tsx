import Container from "@/components/Container";
import { ENTERPRISE_DESCRIPTION, ENTERPRISE_SERVICES } from "@/data/enterprise";
import { ENTERPRISE_PDF_URL, BOOKING_PAYMENT_URL } from "@/lib/links";
import { DownloadIcon, ServiceIcon, CalendarIcon } from "./icons";

// Standard-page counterpart to the 3D gallery's Enterprise Hall, reading the
// shared src/data/enterprise.ts.
export default function EnterprisePanel() {
  return (
    <section id="enterprise" aria-labelledby="enterprise-title" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-gallery-accent/20 bg-gradient-to-br from-gallery-accent/[0.09] via-gallery-charcoal to-gallery-charcoal p-6 sm:p-10 lg:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gallery-accent/10 blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <div>
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent">
                <span className="h-px w-8 bg-gallery-accent/60" aria-hidden />
                Enterprise Hall
              </p>
              <h2
                id="enterprise-title"
                className="text-3xl font-light leading-[1.1] tracking-tight text-gallery-white sm:text-4xl"
              >
                Business &amp; Enterprise Services
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gallery-light/75 sm:text-[17px]">
                {ENTERPRISE_DESCRIPTION}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={ENTERPRISE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gallery-accent px-5 py-3 text-[14px] font-medium text-gallery-black transition-colors hover:bg-[#d9b95c]"
                >
                  <DownloadIcon /> Download PDF
                </a>
                <a
                  href={BOOKING_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[14px] font-medium text-gallery-white transition-colors hover:border-gallery-accent/50 hover:text-gallery-accent"
                >
                  <CalendarIcon className="h-4 w-4" /> Book a Call
                </a>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {ENTERPRISE_SERVICES.map((service, i) => (
                <li
                  key={service}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gallery-black/55 p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gallery-accent/30 bg-gallery-accent/10 text-gallery-accent">
                    <ServiceIcon index={i} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12px] tabular-nums text-gallery-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block text-[16px] font-medium text-gallery-white">{service}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
