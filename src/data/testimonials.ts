export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
}

// Single source of truth for client testimonials, shared by the 3D
// gallery's Client Reviews projector (src/components/sections/TestimonialProjector.tsx)
// and the standard page's testimonials section (src/components/TestimonialsSection.tsx).
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "maria-lush-brows",
    quote:
      "I'm a returning client of Byron for years now! Ever since he helped create my logo design and event flyers it was only natural I return to him for my website design! He was able to achieve everything I was looking for in my website design and I'm very pleased with all of his work! He definitely goes above and beyond to get your projects done in a timely manner and is very engaging when asking questions to ensure he understood the assignment correctly before proceeding. I also love the way he presents you with several designs so you have a few to pick from! I definitely recommend him for any design, logo, website projects anyone has in mind! He's a very professional person and honest!",
    name: "Maria",
    title: "Owner, Lush Brows",
  },
  {
    id: "jonnybeetv",
    quote:
      "Byron Brown has helped out tremendously with logos and graphic designs to help out my media platform JonnyBeeTV. He creatively put together my first ever logo and also made improvements and updates on my latest logo! Byron has also been very helpful with any ideas and advice on planning to help advance the JonnyBeeTV platform. I highly recommend his work!",
    name: "JonnyBeeTV",
    title: "Media Platform",
  },
  {
    id: "gigi-ladi-luck",
    quote:
      "I had a great experience working with Byron! He was professional and really took the time to understand exactly what I was looking for. I would definitely recommend him to anyone looking for high-quality service. The final design was exactly what I pictured.",
    name: "Gigi",
    title: "Ladi Luck Pet Apparel & Grooming, Client",
  },
  {
    id: "silke-dot-vision-minds",
    quote:
      "I've had the fantastic fortune of using Bottor Technologies services, working directly with the founder, Byron Brown, on multiple projects. I connected with Byron on LinkedIn and he supported our relationship by attending a youth talent show I was hosting. From there, I gained a deeper understanding of his work including his youth literacy app, Wiggle Woo's Word Quest, his hip-hop music, and his website development. We ended up deciding to collab on an event, Demo Dat Discography, in which he was extremely consistent and reliable through the entire process of event formatting, marketing and branding, and day of facilitation. I also hired him to build my website, www.visionmindsent.com, which he accomplished every idea I thought of in exceptional promptness, clarity, and deliverable execution. My best way to describe Bottor Technologies is excellence, professionalism, quality, dedication / commitment, and innovative. I highly recommend their services for all things tech, hip-hop, and community / youth development.",
    name: 'Joseph "SilkE dot" Wilke',
    title: "CEO, Vision Minds Entertainment",
  },
];
