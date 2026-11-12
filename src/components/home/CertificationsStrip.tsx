import { CERTIFICATIONS } from "@/data/certifications";
import Container from "@/components/Container";
import { ArrowUpRightIcon } from "./icons";

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Home-page presentation of src/data/certifications.ts. The 3D gallery keeps
// using the shared <CertificationBadges />; this is a full-width band so the
// credentials read as a row of proof rather than a cramped side column.
export default function CertificationsStrip() {
  if (CERTIFICATIONS.length === 0) return null;

  return (
    <section aria-labelledby="certifications-title" className="border-y border-white/[0.06] bg-gallery-charcoal/60">
      <Container className="py-10 sm:py-12">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2
            id="certifications-title"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-gallery-accent"
          >
            Certifications
          </h2>
          <p className="text-[13px] text-gallery-muted">
            Accessibility, leadership, and nonprofit credentials — select one to verify.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CERTIFICATIONS.map((cert) => (
            <li key={cert.title}>
              <a
                href={cert.verifyUrl}
                target={cert.verifyUrl ? "_blank" : undefined}
                rel={cert.verifyUrl ? "noopener noreferrer" : undefined}
                className="group flex h-full items-center gap-4 rounded-xl border border-white/[0.07] bg-gallery-black/50 p-4 transition-colors hover:border-gallery-accent/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- small badge art, mixed formats */}
                <img
                  src={cert.image}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-full bg-white/[0.06] object-contain p-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium leading-snug text-gallery-white">{cert.title}</p>
                  <p className="mt-1 text-[12px] leading-snug text-gallery-muted">
                    {cert.issuer} · {formatDate(cert.issuedDate)}
                  </p>
                </div>
                {cert.verifyUrl && (
                  <ArrowUpRightIcon className="h-4 w-4 shrink-0 self-start text-gallery-muted transition-colors group-hover:text-gallery-accent" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
