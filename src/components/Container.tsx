import type { ReactNode } from "react";

/**
 * Global layout container — used on every standard (non-3D) page.
 *
 * Breakpoints:
 *   mobile  (<640px):   20px horizontal padding
 *   tablet  (640-1023): 32px
 *   laptop  (1024-1279):48px
 *   desktop (1280px+):  64px
 *
 * Max content width: 1280px, centered.
 */
interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12 xl:px-16 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
