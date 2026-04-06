"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GallerySection from "../GallerySection";
import SectionLabel from "../SectionLabel";

export default function CommissionDesk() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <GallerySection id="commission-desk" spotlight>
      <SectionLabel
        label="Commission Desk"
        title="Start a Project"
        description="Have an idea, a project, or a collaboration in mind? Fill out the form below and I will get back to you."
      />

      <div className="mx-auto max-w-2xl">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gallery-frame rounded-2xl p-8 md:p-10 text-center"
          >
            <div className="mb-4 text-4xl text-gallery-accent">&#10003;</div>
            <h3 className="text-xl font-light text-gallery-white">
              Message Sent
            </h3>
            <p className="mt-3 text-sm text-gallery-muted">
              Thank you for reaching out. I will get back to you soon.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="gallery-frame rounded-2xl p-8 md:p-10"
            action="https://api.web3forms.com/submit"
            method="POST"
            onSubmit={() => {
              setTimeout(() => setSubmitted(true), 100);
            }}
          >
            <input
              type="hidden"
              name="access_key"
              value="8cccd495-aec7-461a-9e68-8653dc65a19f"
            />
            <input
              type="hidden"
              name="subject"
              value="New message from Created by Coach B site"
            />
            <input type="hidden" name="from_name" value="Coach B Website" />
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: "none" }}
            />

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-gallery-muted"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  required
                  className="w-full rounded-xl border border-gallery-gray bg-gallery-dark/50 px-5 py-3 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none transition-colors focus:border-gallery-accent/40 focus:bg-gallery-dark"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-gallery-muted"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl border border-gallery-gray bg-gallery-dark/50 px-5 py-3 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none transition-colors focus:border-gallery-accent/40 focus:bg-gallery-dark"
                />
              </div>

              {/* Project type */}
              <div>
                <label
                  htmlFor="project_type"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-gallery-muted"
                >
                  What Do You Need
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  required
                  className="w-full rounded-xl border border-gallery-gray bg-gallery-dark/50 px-5 py-3 text-sm text-gallery-white outline-none transition-colors focus:border-gallery-accent/40 focus:bg-gallery-dark appearance-none"
                >
                  <option value="" className="bg-gallery-dark">
                    Select an option
                  </option>
                  <option value="Website Build" className="bg-gallery-dark">
                    Website Build
                  </option>
                  <option
                    value="Branding / Design"
                    className="bg-gallery-dark"
                  >
                    Branding / Design
                  </option>
                  <option
                    value="Automation Tools"
                    className="bg-gallery-dark"
                  >
                    Automation Tools
                  </option>
                  <option value="Other" className="bg-gallery-dark">
                    Other
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-gallery-muted"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project"
                  required
                  className="w-full resize-none rounded-xl border border-gallery-gray bg-gallery-dark/50 px-5 py-3 text-sm text-gallery-white placeholder-gallery-muted/40 outline-none transition-colors focus:border-gallery-accent/40 focus:bg-gallery-dark"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full rounded-xl bg-gallery-accent py-4 text-sm font-medium tracking-wide text-gallery-black transition-all hover:bg-gallery-accent/90 hover:shadow-lg hover:shadow-gallery-accent/20"
              >
                Send Message
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>
    </GallerySection>
  );
}
