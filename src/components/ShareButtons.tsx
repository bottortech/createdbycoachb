"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silent fail
    }
  }

  const twitterHref = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 1rem",
    borderRadius: "9999px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "rgba(138,138,138,0.85)",
    fontSize: "0.8125rem",
    letterSpacing: "0.01em",
    textDecoration: "none",
    cursor: "pointer",
    transition: "border-color 0.2s, color 0.2s",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: "rgba(138,138,138,0.55)",
          marginRight: "0.25rem",
        }}
      >
        Share
      </span>

      <button
        type="button"
        onClick={handleCopy}
        style={{
          ...chipStyle,
          color: copied ? "var(--color-gallery-accent)" : "rgba(138,138,138,0.85)",
          borderColor: copied ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.1)",
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Copy link
          </>
        )}
      </button>

      <a href={twitterHref} target="_blank" rel="noopener noreferrer" style={chipStyle}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Share on X
      </a>

      <a href={linkedInHref} target="_blank" rel="noopener noreferrer" style={chipStyle}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share on LinkedIn
      </a>
    </div>
  );
}
