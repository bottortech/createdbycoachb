"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import FeedbackToast from "@/components/FeedbackToast";
import { detectWebGL } from "@/lib/webgl";

const GalleryScene = dynamic(
  () => import("@/components/r3f/GalleryScene"),
  { ssr: false }
);

export default function GalleryPage() {
  const [webglState, setWebglState] = useState<"checking" | "high" | "medium" | "low" | "none">("checking");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const result = detectWebGL();
    if (!result.supported) {
      setWebglState("none");
    } else {
      setWebglState(result.performance);
    }
    const dismissed = sessionStorage.getItem("coachb_standard_banner_dismissed");
    if (dismissed) setBannerDismissed(true);
  }, []);

  const showBanner =
    !bannerDismissed &&
    webglState !== "checking" &&
    (webglState === "none" || webglState === "low");

  const showSubtleLink = !bannerDismissed && (webglState === "medium" || webglState === "high");

  const handleDismiss = () => {
    setBannerDismissed(true);
    sessionStorage.setItem("coachb_standard_banner_dismissed", "1");
  };

  return (
    <>
      <GalleryScene />
      <FeedbackToast />

      {/* Prominent fallback banner — shown when WebGL is unsupported or software-rendered */}
      {showBanner && (
        <div className="fixed bottom-6 left-1/2 z-200 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md">
          <div className="flex items-start gap-3 rounded-2xl border border-gallery-accent/30 bg-gallery-charcoal/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-gallery-accent/15 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-gallery-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gallery-white">
                {webglState === "none" ? "3D not supported on this device" : "Performance may be limited"}
              </p>
              <p className="mt-0.5 text-[11px] text-gallery-muted leading-relaxed">
                {webglState === "none"
                  ? "Your browser doesn't support WebGL. Switch to the standard view for the full portfolio."
                  : "Your device may struggle with the 3D gallery. The standard view loads instantly on any device."}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-full bg-gallery-accent px-4 py-1.5 text-[11px] font-medium tracking-wide text-gallery-black transition-all hover:bg-gallery-accent/90"
                >
                  Switch to Standard View
                </Link>
                <button
                  onClick={handleDismiss}
                  className="text-[10px] text-gallery-muted hover:text-gallery-white transition-colors"
                >
                  Stay in 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtle standard view link — always available for users who want it */}
      {showSubtleLink && (
        <div className="fixed bottom-4 right-4 z-150">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-white/8 bg-black/60 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-gallery-muted backdrop-blur-sm transition-all hover:border-white/20 hover:text-gallery-white"
          >
            <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            Standard View
          </Link>
        </div>
      )}
    </>
  );
}
