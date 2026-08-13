import type { Project } from "@/components/gallery/ProjectModal";

export interface ProjectEntry extends Project {
  id: string;
}

// Single source of truth for portfolio project content, shared by the
// standard page's "Selected Projects" grid (src/app/page.tsx) and the 3D
// gallery's wall art (src/components/r3f/GalleryRoom.tsx). Add a project
// here once and it shows up in both views — no more hand-copying an entry
// into one file and forgetting the other.
export const PROJECTS: ProjectEntry[] = [
  {
    id: "wigglewoo",
    title: "WiggleWoo's Word Quest",
    category: "Educational Game / Web App",
    image: "/images/ipad-game-view.jpg",
    description: "An interactive reading game designed for early learners. Players tap letters to form words, move through themed environments, and build real reading skills through play.",
    tags: ["Interactive", "Phonics", "Early Reading"],
    link: "https://wigglewoo.app",
    linkLabel: "Join Waitlist",
  },
  {
    id: "retrorack",
    title: "RetroRack",
    category: "Web Application",
    image: "/images/retrorack-web-app.jpg",
    description: "A web based platform for collecting, organizing, and showcasing retro tech.",
    tags: ["Web App", "React", "Full Stack"],
    link: "https://retrorack.app/",
    linkLabel: "Visit RetroRack",
  },
  {
    id: "bottor-assist",
    title: "Bottor Assist",
    category: "AI Powered Tool",
    image: "/images/bottor-assist.jpg",
    description: "An intelligent assistant platform designed to streamline workflows and automate repetitive tasks.",
    tags: ["AI", "Automation", "Productivity"],
    link: "https://bottor-assist-xxxxx.lovable.app/",
    linkLabel: "Explore Bottor Assist",
  },
  {
    id: "professor-wigglewoo",
    title: "Professor WiggleWoo",
    category: "Featured Publication",
    image: "/images/book-cover.jpg",
    description: "A creative and imaginative story that brings wonder, learning, and fun to readers of all ages. This is more than a book — it is the beginning of a universe.",
    tags: ["Published", "Children's Literature", "Education"],
    link: "https://a.co/d/0di3W4os",
    linkLabel: "Buy on Amazon",
  },
  {
    id: "carlas-creation",
    title: "Carla's Creation",
    category: "Branding",
    image: "/images/carlas-creation.jpg",
    description: "Brand identity crafted with a personal, refined touch.",
    tags: ["Branding", "Identity", "Design"],
  },
  {
    id: "jb-tv",
    title: "JB TV",
    category: "Graphics",
    image: "/images/jb-tv.jpg",
    description: "Visual graphics and branding for JB TV.",
    tags: ["Graphics", "Branding", "Identity"],
  },
  {
    id: "retrorack-extension",
    title: "RetroRack Extension",
    category: "Chrome Extension",
    image: "/images/retrorack-extension.jpg",
    description: "The companion browser extension for RetroRack.",
    tags: ["Chrome Extension", "Browser Tool"],
    link: "https://chromewebstore.google.com/detail/dmofdijhloefhkhheimljfjchccgnhgf?utm_source=item-share-cb",
    linkLabel: "Get the Extension",
  },
  {
    id: "lush-brows",
    title: "Lush Brows",
    category: "Logo Design",
    image: "/images/lush-brows-logo.png",
    description: "A clean, refined mark that reflects elegance and care.",
    tags: ["Logo", "Beauty", "Identity"],
  },
  {
    id: "vision-minds",
    title: "Vision Minds Entertainment",
    category: "Website Design",
    image: "/images/silke-vme-website.png",
    description: "Website for an entertainment company focused on creative ownership, mentorship, and authentic content for youth and hip-hop audiences.",
    tags: ["Web Design", "Entertainment", "Client Work"],
    link: "https://www.visionmindsent.com/",
    linkLabel: "Visit Vision Minds Entertainment",
  },
  {
    id: "retrorack-logo",
    title: "RetroRack Logo",
    category: "Logo Design",
    image: "/images/retro-rack-logo.jpg",
    description: "Brand mark channeling the warmth of retro hardware.",
    tags: ["Logo", "Brand Mark", "Tech"],
    link: "https://retrorack.app/",
    linkLabel: "Visit RetroRack",
  },
  {
    id: "by-any-means",
    title: "By Any Means",
    category: "Logo Design",
    image: "/images/By-any-means-logo.jpg",
    description: "Logo and identity design built to feel confident, focused, and bold.",
    tags: ["Logo", "Brand Mark", "Identity"],
  },
  {
    id: "wigglewoo-character",
    title: "WiggleWoo Character",
    category: "Character Design",
    image: "/images/Wiggle-Woo-Character.png",
    description: "Original character design for WiggleWoo's Word Quest.",
    tags: ["Character Design", "Illustration"],
    link: "https://wigglewoo.app",
    linkLabel: "Visit WiggleWoo",
  },
];

export function getProject(id: string): ProjectEntry {
  const project = PROJECTS.find((p) => p.id === id);
  if (!project) {
    throw new Error(`getProject: no project with id "${id}"`);
  }
  return project;
}
