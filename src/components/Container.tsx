import type { ReactNode } from "react";

/**
 * Global layout container — used on every standard (non-3D) page.
 *
 * Breakpoints:
 *   mobile  (<640px):   20px horizontal padding
 *   tablet  (640-1023): 32px
 *   desktop (1024px+):  64px
 *
 * Max content width: 1400px, centered. Screens wider than that get extra
 * centering margin on top of the padding for free (mx-auto).
 */
interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-350 px-5 sm:px-8 lg:px-16 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
