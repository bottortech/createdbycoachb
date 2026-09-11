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
];
