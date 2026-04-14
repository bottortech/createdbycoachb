"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import ProjectModal, { Project } from "./ProjectModal";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface WallPiece {
  id: string;
  x: number;       // px from left edge of corridor
  y: number;       // % from top of wall zone (0 = ceiling line, 100 = floor line)
  width: number;   // px width of the framed piece
  frame: "square" | "landscape" | "portrait";
  project: Project;
}

interface ZoneLabel {
  x: number;
  text: string;
  sub?: string;
}

// Frame configs: aspect ratio + cutout insets
const FRAME = {
  square:    { src: "/images/frames/frame-square.png",    aspect: 1,     cut: { t: 0.16, r: 0.15, b: 0.16, l: 0.15 } },
  landscape: { src: "/images/frames/frame-landscape.png", aspect: 3 / 2, cut: { t: 0.18, r: 0.15, b: 0.18, l: 0.15 } },
  portrait:  { src: "/images/frames/frame-portrait.png",  aspect: 2 / 3, cut: { t: 0.13, r: 0.16, b: 0.13, l: 0.16 } },
};

// Zone start positions (px). Each zone is a section of the corridor.
const ZONES = [
  { x: 0,     id: "entrance",              label: "Entrance" },
  { x: 1400,  id: "featured-exhibit",      label: "Main Hall" },
  { x: 3000,  id: "product-wing",          label: "Product Wing" },
  { x: 5200,  id: "creative-gallery",      label: "Creative Wing" },
  { x: 8000,  id: "author-exhibit",        label: "The Library" },
  { x: 9600,  id: "government-enterprise", label: "Enterprise Hall" },
  { x: 11200, id: "studio",               label: "The Studio" },
  { x: 12600, id: "book-a-call",          label: "Appointments" },
  { x: 13800, id: "commission-desk",      label: "Commission Desk" },
  { x: 15200, id: "social-wall",          label: "Connect" },
];

const CORRIDOR_WIDTH = 16400;

const ZONE_LABELS: ZoneLabel[] = [
  { x: 200,   text: "Welcome to the Gallery" },
  { x: 1500,  text: "Main Hall",          sub: "Featured Exhibit" },
  { x: 3100,  text: "Product Wing",       sub: "Active Products" },
  { x: 5300,  text: "Creative Wing",      sub: "Design Work" },
  { x: 8100,  text: "The Library",        sub: "Published Works" },
  { x: 9700,  text: "Enterprise Hall",    sub: "Bottor Technologies" },
  { x: 11300, text: "The Studio",         sub: "About Coach B" },
  { x: 12700, text: "Appointments",       sub: "Book a Call" },
  { x: 13900, text: "Commission Desk",    sub: "Start a Project" },
  { x: 15300, text: "Connect",            sub: "Stay Connected" },
];

const pieces: WallPiece[] = [
  // --- FEATURED EXHIBIT (1 large piece) ---
  { id: "wigglewoo", x: 1900, y: 30, width: 580, frame: "landscape", project: {
    title: "WiggleWoo's Word Quest", category: "Featured Exhibit", image: "/images/ipad-game-view.png",
    description: "An interactive reading game designed for early learners. Players tap letters to form words, move through themed environments, and build real reading skills through play. Structured across multiple tiers from simple CVC words to complex patterns.",
    tags: ["Interactive", "Phonics", "Early Reading", "Game Based Learning"],
    link: "https://wigglewoo.app", linkLabel: "Join Waitlist",
  }},

  // --- PRODUCT WING (3 pieces at varying heights) ---
  { id: "retrorack", x: 3300, y: 22, width: 420, frame: "landscape", project: {
    title: "RetroRack.app", category: "Web Application", image: "/images/retrorack-web-app.png",
    description: "A web based platform for collecting, organizing, and showcasing retro tech. Built for enthusiasts who appreciate the beauty of vintage hardware.",
    tags: ["Web App", "React", "Full Stack"], link: "https://retrorack.app/", linkLabel: "Visit RetroRack",
  }},
  { id: "extension", x: 3900, y: 38, width: 380, frame: "landscape", project: {
    title: "RetroRack Extension", category: "Chrome Extension", image: "/images/retrorack-extension.jpg",
    description: "The companion browser extension for RetroRack. Clip retro finds from anywhere on the web and add items to your collection without leaving the page.",
    tags: ["Chrome Extension", "Browser Tool"],
    link: "https://chromewebstore.google.com/detail/dmofdijhloefhkhheimljfjchccgnhgf?utm_source=item-share-cb", linkLabel: "Get the Extension",
  }},
  { id: "bottor", x: 4500, y: 26, width: 400, frame: "landscape", project: {
    title: "Bottor Assist", category: "AI Powered Tool", image: "/images/bottor-assist.png",
    description: "An intelligent assistant platform designed to streamline workflows, automate repetitive tasks, and bring AI capabilities into everyday business operations.",
    tags: ["AI", "Automation", "Productivity"],
    link: "https://bottor-assist-xxxxx.lovable.app/", linkLabel: "Explore Bottor Assist",
  }},

  // --- CREATIVE WING (6 pieces, gallery salon hang) ---
  { id: "wiggle-char", x: 5500, y: 18, width: 300, frame: "square", project: {
    title: "WiggleWoo Character", category: "Character Design", image: "/images/Wiggle-Woo-Character.png",
    description: "Original character design for WiggleWoo's Word Quest. The character anchors the brand identity and guides players through the experience.",
    tags: ["Character Design", "Illustration", "Branding"], link: "https://wigglewoo.app", linkLabel: "Visit WiggleWoo",
  }},
  { id: "carla", x: 5950, y: 35, width: 280, frame: "square", project: {
    title: "Carla's Creation", category: "Branding", image: "/images/carlas-creation.png",
    description: "Brand identity work crafted with a personal, refined touch. A study in elevated visual storytelling.",
    tags: ["Branding", "Identity", "Design"],
  }},
  { id: "jbtv", x: 6350, y: 20, width: 320, frame: "square", project: {
    title: "JB TV", category: "Graphics", image: "/images/jb-tv.png",
    description: "Visual graphics and branding for JB TV. A bold, contemporary look that brings the broadcast identity to life.",
    tags: ["Graphics", "Branding", "Identity"],
  }},
  { id: "bam", x: 6800, y: 38, width: 260, frame: "square", project: {
    title: "By Any Means", category: "Logo", image: "/images/By-any-means-logo.png",
    description: "Logo and identity design for By Any Means. A statement mark built to feel confident, focused, and bold.",
    tags: ["Logo", "Brand Mark", "Identity"],
  }},
  { id: "lush", x: 7150, y: 16, width: 240, frame: "square", project: {
    title: "Lush Brows", category: "Logo", image: "/images/lush-brows-logo.png",
    description: "Logo design for Lush Brows. A clean, refined mark that reflects the elegance and care of the brand.",
    tags: ["Logo", "Beauty", "Identity"],
  }},
  { id: "rr-logo", x: 7500, y: 32, width: 280, frame: "square", project: {
    title: "RetroRack", category: "Logo", image: "/images/retro-rack-logo.png",
    description: "Brand mark for RetroRack. The logo channels the warmth of retro hardware while feeling modern and clean.",
    tags: ["Logo", "Brand Mark", "Tech"], link: "https://retrorack.app/", linkLabel: "Visit RetroRack",
  }},

  // --- THE LIBRARY (1 portrait piece) ---
  { id: "book", x: 8700, y: 18, width: 340, frame: "portrait", project: {
    title: "Professor WiggleWoo", category: "Featured Publication", image: "/images/book-cover.jpg",
    description: "A creative and imaginative story that brings wonder, learning, and fun to readers of all ages. Written with care, illustrated with purpose, and published with pride. This is more than a book. It is the beginning of a universe.",
    tags: ["Published", "Children's Literature", "Education"],
    link: "https://a.co/d/0di3W4os", linkLabel: "Buy on Amazon",
  }},
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function GalleryWalkthrough() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentZone, setCurrentZone] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const wallParallaxRef = useRef<HTMLDivElement>(null);
  const floorParallaxRef = useRef<HTMLDivElement>(null);
  const ceilingParallaxRef = useRef<HTMLDivElement>(null);
  const lightParallaxRef = useRef<HTMLDivElement>(null);

  const cameraTarget = useRef(0);
  const cameraPos = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const maxScroll = typeof window !== "undefined" ? CORRIDOR_WIDTH - window.innerWidth : CORRIDOR_WIDTH - 1920;

  // --- SMOOTH CAMERA ANIMATION ---
  useEffect(() => {
    let raf: number;
    const animate = () => {
      const diff = cameraTarget.current - cameraPos.current;
      cameraPos.current += diff * 0.07;

      // Snap if close enough
      if (Math.abs(diff) < 0.5) cameraPos.current = cameraTarget.current;

      const x = cameraPos.current;

      if (trackRef.current)          trackRef.current.style.transform = `translateX(${-x}px)`;
      if (wallParallaxRef.current)   wallParallaxRef.current.style.transform = `translateX(${-x * 0.95}px)`;
      if (floorParallaxRef.current)  floorParallaxRef.current.style.transform = `translateX(${-x * 0.85}px)`;
      if (ceilingParallaxRef.current) ceilingParallaxRef.current.style.transform = `translateX(${-x * 0.7}px)`;
      if (lightParallaxRef.current)  lightParallaxRef.current.style.transform = `translateX(${-x * 0.9}px)`;

      // Determine current zone
      let zone = 0;
      for (let i = ZONES.length - 1; i >= 0; i--) {
        if (x >= ZONES[i].x - 400) { zone = i; break; }
      }
      setCurrentZone(zone);

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- SCROLL WHEEL ---
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (selectedProject) return;
      e.preventDefault();
      cameraTarget.current += e.deltaY * 1.8;
      cameraTarget.current = Math.max(0, Math.min(cameraTarget.current, maxScroll));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [selectedProject, maxScroll]);

  // --- KEYBOARD ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedProject) return;
      const step = 600;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        cameraTarget.current = Math.min(cameraTarget.current + step, maxScroll);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        cameraTarget.current = Math.max(cameraTarget.current - step, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProject, maxScroll]);

  // --- TOUCH/SWIPE ---
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchStartRef.current = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      if (selectedProject || touchStartRef.current === null) return;
      const diff = touchStartRef.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return;
      cameraTarget.current += diff * 3;
      cameraTarget.current = Math.max(0, Math.min(cameraTarget.current, maxScroll));
      touchStartRef.current = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [selectedProject, maxScroll]);

  // Jump to zone
  const goToZone = useCallback((index: number) => {
    cameraTarget.current = Math.max(0, Math.min(ZONES[index].x - 100, maxScroll));
  }, [maxScroll]);

  // Track light positions (every ~800px across the corridor)
  const trackLightCount = Math.ceil(CORRIDOR_WIDTH / 800);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#050403" }}>

      {/* ============ CEILING ============ */}
      <div className="absolute inset-x-0 top-0 h-[13vh] z-[2]" style={{ overflow: "hidden" }}>
        <div
          ref={ceilingParallaxRef}
          className="absolute top-0 h-full will-change-transform"
          style={{
            width: `${CORRIDOR_WIDTH}px`,
            backgroundImage: "url('/images/gallery/ceiling.png')",
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat-x",
          }}
        />
        {/* Ceiling bottom edge */}
        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-2" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }} />
      </div>

      {/* ============ TRACK LIGHTS ============ */}
      <div className="absolute inset-x-0 top-[2vh] h-[12vh] z-[3]" style={{ overflow: "hidden" }}>
        <div
          ref={lightParallaxRef}
          className="absolute top-0 h-full will-change-transform"
          style={{ width: `${CORRIDOR_WIDTH}px` }}
        >
          {Array.from({ length: trackLightCount }, (_, i) => {
            const lx = i * 800 + 400;
            return (
              <div key={i} className="absolute" style={{ left: `${lx}px`, top: "1vh", width: "140px", height: "95px", transform: "translateX(-50%)" }}>
                <Image src="/images/gallery/track-light.png" alt="" width={300} height={200} className="h-full w-full object-contain object-top" style={{ filter: "brightness(0.9) drop-shadow(0 3px 6px rgba(0,0,0,0.5))" }} />
              </div>
            );
          })}
          {/* Light beams */}
          {Array.from({ length: trackLightCount }, (_, i) => {
            const lx = i * 800 + 400;
            return (
              <div key={`beam-${i}`} className="absolute" style={{ left: `${lx}px`, top: "9vh", width: "280px", height: "70vh", transform: "translateX(-50%)", mixBlendMode: "screen", opacity: 0.65 }}>
                <Image src="/images/gallery/light-beam.svg" alt="" width={400} height={800} className="h-full w-full" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ WALL ============ */}
      <div className="absolute inset-x-0 top-[13vh] bottom-[22vh] z-[1]" style={{ overflow: "hidden" }}>
        <div
          ref={wallParallaxRef}
          className="absolute top-0 h-full will-change-transform"
          style={{
            width: `${CORRIDOR_WIDTH * 1.05}px`,
            backgroundImage: "url('/images/gallery/wall.png')",
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>

      {/* ============ FLOOR ============ */}
      <div className="absolute inset-x-0 bottom-0 h-[25vh] z-[2]" style={{ overflow: "hidden" }}>
        <div
          ref={floorParallaxRef}
          className="absolute top-0 h-full will-change-transform"
          style={{
            width: `${CORRIDOR_WIDTH * 1.15}px`,
            backgroundImage: "url('/images/gallery/floor.png')",
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat-x",
          }}
        />
        {/* Floor/wall horizon line */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)" }} />
      </div>

      {/* ============ MAIN CONTENT TRACK ============ */}
      <div
        ref={trackRef}
        className="absolute top-[13vh] bottom-[22vh] z-[5] will-change-transform"
        style={{ width: `${CORRIDOR_WIDTH}px` }}
      >
        {/* --- ZONE LABELS on the wall --- */}
        {ZONE_LABELS.map((zl) => (
          <div key={zl.x} className="absolute" style={{ left: `${zl.x}px`, top: "4%" }}>
            {zl.sub && (
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-gallery-accent/80" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>
                {zl.sub}
              </p>
            )}
            <p className="mt-1 text-lg font-light text-gallery-white/90 md:text-2xl" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}>
              {zl.text}
            </p>
          </div>
        ))}

        {/* --- ENTRANCE TEXT --- */}
        <div className="absolute flex flex-col items-center" style={{ left: "200px", top: "15%", width: "1000px" }}>
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-gallery-accent/80" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>Welcome to the Gallery</p>
          <h1 className="mt-4 text-center text-4xl font-extralight leading-tight text-gallery-white md:text-6xl lg:text-7xl" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
            Everything Here Was<br /><span className="text-gallery-accent">Created by Coach B</span>
          </h1>
          <p className="mt-4 text-center text-base text-gallery-light/70" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
            Builder. Designer. Founder. Author. Artist.
          </p>
        </div>

        {/* --- ENTERPRISE INFO CARDS --- */}
        <div className="absolute" style={{ left: "9800px", top: "10%", width: "1200px" }}>
          <div className="grid grid-cols-3 gap-3">
            {["Software Development", "Automation Tools", "UI and UX Systems", "Digital Product Development", "Professional Services", "AI and Data Solutions"].map((cap) => (
              <div key={cap} className="rounded-lg border border-white/[0.06] bg-black/50 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-gallery-white">{cap}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <a href="https://drive.google.com/file/d/1XmDidqSyxh_tNgDYXagU_YvNmm1Nx8-C/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="rounded-full border border-gallery-gray px-4 py-2 text-[10px] font-medium text-gallery-light hover:border-gallery-accent hover:text-gallery-accent transition-colors">Download PDF</a>
          </div>
        </div>

        {/* --- STUDIO ROLES --- */}
        <div className="absolute" style={{ left: "11400px", top: "12%", width: "1000px" }}>
          <div className="grid grid-cols-3 gap-3">
            {["Builder", "Creative Technologist", "Product Creator", "Founder", "Author"].map((role) => (
              <div key={role} className="rounded-lg border border-white/[0.06] bg-black/50 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] font-medium text-gallery-white">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- APPOINTMENTS --- */}
        <div className="absolute" style={{ left: "12800px", top: "15%", width: "400px" }}>
          <div className="rounded-xl border border-white/[0.06] bg-black/50 p-6 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gallery-accent">30 Minutes</p>
            <p className="mt-2 text-3xl font-extralight text-gallery-white">$75</p>
            <p className="mt-3 text-xs text-gallery-muted leading-relaxed">A focused session for strategy, feedback, or guidance.</p>
            <a href="https://calendly.com/byron-brown31/30min" target="_blank" rel="noopener noreferrer" className="mt-4 block w-full rounded-lg bg-gallery-accent py-2.5 text-center text-xs font-medium text-gallery-black transition-all hover:bg-gallery-accent/90">Book 30 Minutes</a>
          </div>
        </div>

        {/* --- COMMISSION FORM --- */}
        <div className="absolute" style={{ left: "14000px", top: "8%", width: "420px" }}>
          <form action="https://api.web3forms.com/submit" method="POST" className="rounded-xl border border-white/[0.06] bg-black/50 p-5 backdrop-blur-sm">
            <input type="hidden" name="access_key" value="8cccd495-aec7-461a-9e68-8653dc65a19f" />
            <input type="hidden" name="subject" value="New message from Created by Coach B site" />
            <input type="hidden" name="from_name" value="Coach B Website" />
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
            <div className="space-y-3">
              <input type="text" name="name" required placeholder="Name" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40" />
              <input type="email" name="email" required placeholder="Email" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40" />
              <select name="project_type" required className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gallery-white outline-none focus:border-gallery-accent/40 appearance-none">
                <option value="">What do you need?</option>
                <option value="Website Build">Website Build</option>
                <option value="Branding / Design">Branding / Design</option>
                <option value="Automation Tools">Automation Tools</option>
                <option value="Other">Other</option>
              </select>
              <textarea name="message" rows={3} required placeholder="Tell me about your project" className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gallery-white placeholder-gallery-muted/40 outline-none focus:border-gallery-accent/40" />
              <button type="submit" className="w-full rounded-lg bg-gallery-accent py-2.5 text-xs font-medium text-gallery-black hover:bg-gallery-accent/90">Send Message</button>
            </div>
          </form>
        </div>

        {/* --- CONNECT / SOCIAL --- */}
        <div className="absolute" style={{ left: "15400px", top: "20%", width: "300px" }}>
          <div className="space-y-3">
            <a href="https://www.linkedin.com/in/byron-brown-b61ab695/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/50 px-4 py-3 backdrop-blur-sm transition-colors hover:border-gallery-accent/20">
              <span className="text-xs font-medium text-gallery-white">LinkedIn</span>
              <span className="text-[10px] text-gallery-muted">Byron Brown</span>
            </a>
            <a href="https://github.com/bottortech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/50 px-4 py-3 backdrop-blur-sm transition-colors hover:border-gallery-accent/20">
              <span className="text-xs font-medium text-gallery-white">GitHub</span>
              <span className="text-[10px] text-gallery-muted">Bottor Technologies</span>
            </a>
          </div>
          <p className="mt-8 text-[9px] text-gallery-muted/30">&copy; {new Date().getFullYear()} Coach B</p>
        </div>

        {/* --- FRAMED ARTWORK PIECES --- */}
        {pieces.map((piece) => {
          const f = FRAME[piece.frame];
          const h = piece.width / f.aspect;
          return (
            <button
              key={piece.id}
              type="button"
              onClick={() => setSelectedProject(piece.project)}
              className="absolute group cursor-pointer"
              style={{
                left: `${piece.x}px`,
                top: `${piece.y}%`,
                width: `${piece.width}px`,
                height: `${h}px`,
              }}
            >
              {/* Spotlight above */}
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-[120%] -translate-x-1/2" style={{ background: "radial-gradient(ellipse at top, rgba(255,225,170,0.14) 0%, transparent 70%)", filter: "blur(12px)" }} />

              {/* Frame container */}
              <div
                className="relative h-full w-full transition-transform duration-500 group-hover:-translate-y-1"
                style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.7)) drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}
              >
                {/* Artwork inside cutout */}
                <div className="absolute overflow-hidden bg-gallery-black" style={{
                  top: `${f.cut.t * 100}%`, right: `${f.cut.r * 100}%`,
                  bottom: `${f.cut.b * 100}%`, left: `${f.cut.l * 100}%`,
                }}>
                  <Image src={piece.project.image} alt={piece.project.title} fill sizes={`${piece.width}px`} className="object-cover" />
                  {/* Glass reflection */}
                  <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.08) 0%, transparent 30%)" }} />
                  {/* Hover tint */}
                  <div className="pointer-events-none absolute inset-0 bg-gallery-accent/0 transition-colors duration-500 group-hover:bg-gallery-accent/10" />
                </div>

                {/* Frame PNG */}
                <Image src={f.src} alt="" fill className="pointer-events-none object-fill" />
              </div>

              {/* Museum label plaque */}
              <div className="mt-2 flex justify-center">
                <div className="relative" style={{ width: `${Math.min(piece.width * 0.45, 140)}px`, height: "22px" }}>
                  <Image src="/images/gallery/plaque.png" alt="" fill className="pointer-events-none object-fill" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
                    <p className="text-[6px] font-bold uppercase tracking-[0.15em] leading-none" style={{ color: "#2a1a08" }}>{piece.project.category}</p>
                    <p className="text-[7px] font-semibold leading-none mt-[1px]" style={{ color: "#1a1108" }}>{piece.project.title}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ============ AMBIENT ============ */}
      <div className="pointer-events-none absolute inset-0 z-[6]" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />

      {/* ============ NAV BAR ============ */}
      <div className="absolute top-0 left-0 right-0 z-[10] bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-8">
          <button onClick={() => { cameraTarget.current = 0; }} className="text-sm font-light tracking-widest text-gallery-white hover:text-gallery-accent transition-colors">COACH B</button>
          <div className="hidden items-center gap-0.5 lg:flex">
            {ZONES.slice(1).map((z, i) => (
              <button key={z.id} onClick={() => goToZone(i + 1)} className={`rounded-full px-2.5 py-1 text-[10px] tracking-wide transition-all duration-300 ${currentZone === i + 1 ? "text-gallery-accent bg-gallery-accent-soft" : "text-gallery-muted hover:text-gallery-white"}`}>
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============ PROGRESS BAR ============ */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10] flex items-center gap-3">
        {ZONES.map((z, i) => (
          <button
            key={z.id}
            onClick={() => goToZone(i)}
            className="group relative"
            aria-label={z.label}
          >
            <div className={`h-1 rounded-full transition-all duration-300 ${currentZone === i ? "w-6 bg-gallery-accent" : "w-1.5 bg-white/20 group-hover:bg-white/40"}`} style={{ boxShadow: currentZone === i ? "0 0 8px rgba(201,168,76,0.5)" : "none" }} />
            <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[8px] text-gallery-light opacity-0 transition-opacity group-hover:opacity-100">{z.label}</span>
          </button>
        ))}
      </div>

      {/* ============ SCROLL HINT ============ */}
      <div className="absolute bottom-12 right-8 z-[10] text-[9px] uppercase tracking-[0.2em] text-gallery-muted/40" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
        Scroll to walk through &rarr;
      </div>

      {/* ============ PROJECT MODAL ============ */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
