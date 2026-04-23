"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Tweak these to taste
const TRIGGER_DELAY_MS = 30_000;            // show 30s after first interaction
const SESSION_KEY = "coachb_feedback_seen"; // one popup per session

// Formspree / Getform endpoint. Set in .env.local as:
//   NEXT_PUBLIC_FEEDBACK_ENDPOINT=https://formspree.io/f/xxxxxxxx
// If undefined, submit() falls back to a console log so you can still test.
const ENDPOINT = process.env.NEXT_PUBLIC_FEEDBACK_ENDPOINT;

type Reaction = "up" | "down" | null;

export default function FeedbackToast() {
  const [visible, setVisible] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errored, setErrored] = useState(false);

  // Timer — fires once per session, pauses while the tab is hidden, and
  // starts counting from the user's first real interaction (click / tap /
  // keypress) rather than page-load, so the 15s measures engaged time.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let started = false;
    let elapsed = 0;
    let last = 0;
    let id: number | null = null;

    const tick = () => {
      const now = performance.now();
      if (!document.hidden) elapsed += now - last;
      last = now;
      if (elapsed >= TRIGGER_DELAY_MS) {
        setVisible(true);
        return; // stop ticking once shown
      }
      id = requestAnimationFrame(tick);
    };

    const events = ["pointerdown", "touchstart", "keydown"];
    const startTimer = () => {
      if (started) return;
      started = true;
      last = performance.now();
      id = requestAnimationFrame(tick);
      events.forEach((e) => window.removeEventListener(e, startTimer));
    };
    events.forEach((e) =>
      window.addEventListener(e, startTimer, { once: true, passive: true })
    );

    return () => {
      if (id !== null) cancelAnimationFrame(id);
      events.forEach((e) => window.removeEventListener(e, startTimer));
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  };

  const submit = async () => {
    setSending(true);
    setErrored(false);
    const payload = {
      reaction,
      comment: comment.trim(),
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // eslint-disable-next-line no-console
        console.log("[feedback] (no endpoint configured)", payload);
      }
      sessionStorage.setItem(SESSION_KEY, "1");
      setSubmitted(true);
      setTimeout(() => setVisible(false), 1600);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[feedback] submit failed", err);
      setErrored(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-[200] w-[300px] rounded-xl border border-gallery-accent/25 bg-[#0c0a08]/95 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-gallery-muted transition-colors hover:text-gallery-accent"
            aria-label="Dismiss"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-5">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-3 text-center"
              >
                <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
                  Thank you
                </div>
                <p className="text-[12px] text-gallery-light">Your feedback means a lot.</p>
              </motion.div>
            ) : (
              <>
                <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
                  Coach B
                </div>
                <h3 className="mb-3 text-[14px] font-medium text-gallery-white">
                  Enjoying the gallery?
                </h3>

                {/* Thumbs row */}
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setReaction(reaction === "up" ? null : "up")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                      reaction === "up"
                        ? "border-gallery-accent/70 bg-gallery-accent/15 text-gallery-accent"
                        : "border-white/10 bg-white/[0.02] text-gallery-light hover:border-gallery-accent/40 hover:text-gallery-accent"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Yes
                  </button>
                  <button
                    onClick={() => setReaction(reaction === "down" ? null : "down")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                      reaction === "down"
                        ? "border-gallery-accent/70 bg-gallery-accent/15 text-gallery-accent"
                        : "border-white/10 bg-white/[0.02] text-gallery-light hover:border-gallery-accent/40 hover:text-gallery-accent"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    Not yet
                  </button>
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Anything you'd like to share? (optional)"
                  rows={2}
                  className="mb-3 w-full resize-none rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-[12px] text-gallery-light placeholder:text-gallery-muted/60 focus:border-gallery-accent/40 focus:outline-none"
                />

                <button
                  onClick={submit}
                  disabled={sending || (!reaction && !comment.trim())}
                  className="w-full rounded-md bg-gallery-accent py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-black transition-colors hover:bg-gallery-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? "Sending…" : "Send Feedback"}
                </button>
                {errored && (
                  <p className="mt-2 text-center text-[9px] uppercase tracking-wider text-red-400/80">
                    Could not send — please try again
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
