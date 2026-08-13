import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Gallery | Created by Coach B",
  description:
    "Walk through an immersive 3D gallery, discover hidden rooms, and explore the full portfolio as a curated exhibit.",
  openGraph: {
    title: "3D Gallery | Created by Coach B",
    description:
      "Walk through an immersive 3D gallery, discover hidden rooms, and explore the full portfolio as a curated exhibit.",
    url: "https://createdbycoachb.com/gallery",
    siteName: "Created by Coach B",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Created by Coach B — 3D Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Gallery | Created by Coach B",
    description:
      "Walk through an immersive 3D gallery, discover hidden rooms, and explore the full portfolio as a curated exhibit.",
    images: ["/images/og-default.png"],
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
