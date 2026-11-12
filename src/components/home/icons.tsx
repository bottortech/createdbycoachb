// Small inline icon set for the standard home page. Kept local (rather than a
// dependency) so the page ships no extra icon library.
type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function ArrowRightIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export function PlayCircleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.8v6.4l5.2-3.2L10 8.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6 8.5-6" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

export function MenuIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function DownloadIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...stroke}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function GitHubIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/** Line icons for the six enterprise services, keyed by position. */
export function ServiceIcon({ index, className = "h-5 w-5" }: IconProps & { index: number }) {
  const paths = [
    // Software Development — code brackets
    <path key="0" d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
    // Automation Tools — cycle arrows
    <path key="1" d="M4 12a8 8 0 0113.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 01-13.7 5.6L4 15.3M4 20v-4.7h4.7" />,
    // UI and UX Systems — layout
    <path key="2" d="M4 5h16v14H4zM4 9h16M9 9v10" />,
    // Digital Product Development — layers
    <path key="3" d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
    // Professional Services — briefcase
    <path key="4" d="M4 8h16v11H4zM9 8V5h6v3M4 13h16" />,
    // AI and Data Solutions — spark / chart
    <path key="5" d="M4 19V11M10 19V6M16 19v-5M20 4l-1 2.5L16.5 7.5 19 8.5 20 11l1-2.5L23.5 7.5 21 6.5z" />,
  ];
  return (
    <svg className={className} {...stroke}>
      {paths[index % paths.length]}
    </svg>
  );
}
