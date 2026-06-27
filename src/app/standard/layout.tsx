import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | Created by Coach B",
  description:
    "Product builder, designer, and founder. Projects spanning software, AI, brand design, and digital experiences.",
  openGraph: {
    title: "Portfolio | Created by Coach B",
    description:
      "Product builder, designer, and founder. Projects spanning software, AI, brand design, and digital experiences.",
    url: "https://createdbycoachb.com/standard",
    siteName: "Created by Coach B",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Created by Coach B — Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | Created by Coach B",
    description:
      "Product builder, designer, and founder. Projects spanning software, AI, brand design, and digital experiences.",
    images: ["/images/og-default.png"],
  },
};

export default function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body { overflow: auto !important; height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
