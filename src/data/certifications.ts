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
];
