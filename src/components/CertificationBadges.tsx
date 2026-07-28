"use client";

import { CERTIFICATIONS } from "@/data/certifications";

/** Renders in both the 3D gallery's Studio panel and the /standard page's
 *  about section — add new entries to src/data/certifications.ts and they
 *  show up in both places automatically. */
export default function CertificationBadges() {
  if (CERTIFICATIONS.length === 0) return null;

  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-gallery-accent mb-3">
        Certifications
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CERTIFICATIONS.map((cert) => (
          <a
            key={cert.title}
            href={cert.verifyUrl}
            target={cert.verifyUrl ? "_blank" : undefined}
            rel={cert.verifyUrl ? "noopener noreferrer" : undefined}
            className={`flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors ${
              cert.verifyUrl ? "hover:border-gallery-accent/30 cursor-pointer" : "cursor-default"
            }`}
          >
            <img
              src={cert.image}
              alt={cert.title}
              className="h-12 w-12 shrink-0 rounded-full bg-white/5 object-contain"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium leading-snug text-gallery-white">
                {cert.title}
              </p>
              <p className="mt-1 text-[11px] text-gallery-muted">
                {cert.issuer} ·{" "}
                {new Date(cert.issuedDate + "T12:00:00").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
