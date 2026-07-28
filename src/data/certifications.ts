export interface Certification {
  title: string;
  issuer: string;
  /** ISO date (YYYY-MM-DD) the credential was issued. */
  issuedDate: string;
  image: string;
  verifyUrl?: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    title: "Web Accessibility: The Cornerstone of Digital Society",
    issuer: "ITU Academy",
    issuedDate: "2026-07-27",
    image: "/images/ITU-academy-Byron-Brown.png",
    verifyUrl: "https://credentials.academy.itu.int/b7691e5f-708e-42b6-86d0-805c86c657d2",
  },
  {
    title: "Leadership Essentials Certificate",
    issuer: "NonprofitReady.org (Cornerstone OnDemand Foundation)",
    issuedDate: "2026-07-28",
    image: "/images/Essentials_badge_Leadership_NPR_5151f4d3-b545-4593-8718-e561b8135ed8.png",
    verifyUrl: "/images/leadership-essentials-certificate.pdf",
  },
];
