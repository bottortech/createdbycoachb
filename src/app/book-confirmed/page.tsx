"use client";

import Link from "next/link";
import Container from "@/components/Container";
import GalleryButton from "@/components/GalleryButton";
import { CALENDLY_URL } from "@/lib/links";

export default function BookConfirmedPage() {
  return (
    <main className="min-h-screen py-24">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gallery-accent-soft">
            <svg className="h-6 w-6 text-gallery-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-gallery-accent mb-4">
            Payment Received
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-gallery-white mb-3 tracking-tight">
            You&apos;re all set
          </h1>
          <p className="text-gallery-muted leading-relaxed mb-10">
            Thanks for booking a 1:1 with Coach B. Pick a time that works for you below —
            you&apos;ll get a confirmation and calendar invite once it&apos;s scheduled.
          </p>
          <GalleryButton href={CALENDLY_URL} variant="primary" className="w-full sm:w-auto">
            Choose Your Time
          </GalleryButton>
          <div className="mt-10">
            <Link href="/" className="text-[11px] font-medium text-gallery-muted hover:text-gallery-accent transition-colors">
              &larr; Back to the gallery
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
