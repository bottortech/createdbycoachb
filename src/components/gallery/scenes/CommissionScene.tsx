"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Project } from "../ProjectModal";

interface Props {
  onSelectProject: (p: Project) => void;
}

export default function CommissionScene(_props: Props) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 text-4xl text-gallery-accent">&#10003;</div>
          <h3 className="text-xl font-light text-gallery-white">Message Sent</h3>
          <p className="mt-3 text-sm text-gallery-muted">
            Thank you for reaching out. I will get back to you soon.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gallery-accent">
          Commission Desk
        </span>
        <h2
          className="mt-2 text-2xl font-light text-gallery-white md:text-4xl"
          style={{ textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}
        >
          Start a Project
        </h2>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-black/40 p-6 backdrop-blur-sm md:p-8"
        action="https://api.web3forms.com/submit"
        method="POST"
        onSubmit={() => setTimeout(() => setSubmitted(true), 100)}
      >
        <input type="hidden" name="access_key" value="8cccd495-aec7-461a-9e68-8653dc65a19f" />
        <input type="hidden" name="subject" value="New message from Created by Coach B site" />
        <input type="hidden" name="from_name" value="Coach B Website" />
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">Name</label>
            <input type="text" id="name" name="name" required placeholder="Your full name" className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none transition-colors focus:border-gallery-accent/40" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">Email</label>
            <input type="email" id="email" name="email" required placeholder="your@email.com" className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none transition-colors focus:border-gallery-accent/40" />
          </div>
          <div>
            <label htmlFor="project_type" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">What Do You Need</label>
            <select id="project_type" name="project_type" required className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-gallery-white outline-none transition-colors focus:border-gallery-accent/40 appearance-none">
              <option value="" className="bg-gallery-dark">Select an option</option>
              <option value="Website Build" className="bg-gallery-dark">Website Build</option>
              <option value="Branding / Design" className="bg-gallery-dark">Branding / Design</option>
              <option value="Automation Tools" className="bg-gallery-dark">Automation Tools</option>
              <option value="Other" className="bg-gallery-dark">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-muted">Message</label>
            <textarea id="message" name="message" rows={3} required placeholder="Tell me about your project" className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none transition-colors focus:border-gallery-accent/40" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-gallery-accent py-3 text-sm font-medium tracking-wide text-gallery-black transition-all hover:bg-gallery-accent/90 hover:shadow-lg hover:shadow-gallery-accent/20">
            Send Message
          </button>
        </div>
      </motion.form>
    </div>
  );
}
