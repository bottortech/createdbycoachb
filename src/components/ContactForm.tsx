"use client";

import { useState, type FormEvent } from "react";

// The inquiry form used by both the standard Contact section and the 3D
// gallery's Commission Desk — same Web3Forms endpoint/access key on both,
// so a submission from either experience lands in the same inbox.
const WEB3FORMS_ACCESS_KEY = "8cccd495-aec7-461a-9e68-8653dc65a19f";

const PROJECT_TYPES = ["Website Build", "Branding / Design", "Automation Tools", "Other"];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40";
const labelClass = "mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const result = await res.json();
      if (result.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-gallery-accent/20 bg-gallery-accent-soft p-6 text-center">
        <p className="text-sm font-medium text-gallery-white">Message sent</p>
        <p className="mt-1.5 text-[12px] text-gallery-muted">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
      <input type="hidden" name="subject" value="New message from Created by Coach B site" />
      <input type="hidden" name="from_name" value="Coach B Website" />
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <div>
        <label className={labelClass}>Name</label>
        <input type="text" name="name" required placeholder="Your full name" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" name="email" required placeholder="your@email.com" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>What Do You Need</label>
        <select name="project_type" required defaultValue="" className={`${inputClass} appearance-none`}>
          <option value="" disabled>Select an option</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Message</label>
        <textarea name="message" rows={4} required placeholder="Tell me about your project" className={`${inputClass} resize-none`} />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-gallery-accent py-3 text-sm font-medium text-gallery-black transition-opacity hover:bg-gallery-accent/90 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-[12px] text-red-400">
          Something went wrong sending that — try again, or email directly below.
        </p>
      )}
    </form>
  );
}
