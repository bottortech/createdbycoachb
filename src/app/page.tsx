"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled — Three.js needs the browser
const GalleryScene = dynamic(
  () => import("@/components/r3f/GalleryScene"),
  { ssr: false }
);

export default function Home() {
  return <GalleryScene />;
}
