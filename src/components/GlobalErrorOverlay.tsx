"use client";

import { useEffect, useState } from "react";

/**
 * TEMPORARY diagnostic — catches uncaught JS errors and unhandled promise
 * rejections and shows them as visible on-screen text instead of a silent
 * blank page. Added to track down a mobile "blank black screen" report.
 * Safe to delete once the root cause is found and fixed.
 */
export default function GlobalErrorOverlay() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const add = (msg: string) => setMessages((prev) => [...prev, msg].slice(-5));

    const onError = (e: ErrorEvent) => {
      add(`Error: ${e.message} (${e.filename ?? "?"}:${e.lineno ?? "?"})`);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason instanceof Error ? e.reason.message : String(e.reason);
      add(`Unhandled rejection: ${reason}`);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (messages.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        background: "rgba(200, 0, 0, 0.95)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "10px",
        maxHeight: "50vh",
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: "6px" }}>
          {m}
        </div>
      ))}
    </div>
  );
}
