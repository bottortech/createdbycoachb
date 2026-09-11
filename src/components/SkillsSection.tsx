import Image from "next/image";
import { SKILL_CATEGORIES, CHIP_IMAGES } from "@/data/skills";

// Standard-page counterpart to the 3D gallery's Tech Vault exhibit — a
// condensed card grid rather than a literal copy of the 3D room, reading
// from the same src/data/skills.ts so the two never drift.
export default function SkillsSection() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {SKILL_CATEGORIES.map((category) => (
        <div
          key={category.id}
          className="rounded-2xl border border-white/[0.06] bg-gallery-charcoal/40 p-6"
        >
          <h3 className="text-base font-light text-gallery-white">{category.title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-gallery-muted">{category.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {category.chips.map((chip) => {
              const icon = CHIP_IMAGES[chip];
              return (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gallery-accent-soft px-2.5 py-1 text-[9px] font-medium text-gallery-accent"
                >
                  {icon && (
                    <Image src={icon} alt="" width={12} height={12} className="h-3 w-3 object-contain" />
                  )}
                  {chip}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
