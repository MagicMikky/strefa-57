import type { SVGProps } from "react";

export type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "forest"
  | "mail"
  | "map"
  | "menu"
  | "paint"
  | "phone"
  | "route"
  | "shield"
  | "target"
  | "tower"
  | "trench"
  | "users";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    forest: <><path d="m12 3-5 7h3l-4 6h5v5h2v-5h5l-4-6h3Z"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    map: <><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    paint: <><path d="M12 3c3.8 4.2 6 7.1 6 10a6 6 0 0 1-12 0c0-2.9 2.2-5.8 6-10Z"/><path d="M9.5 15.5c.7 1 1.5 1.5 2.5 1.5"/></>,
    phone: <path d="M7.2 3.6 10 8 8.3 9.7c1.3 2.7 3.3 4.7 6 6l1.7-1.7 4.4 2.8-.8 3c-.2.7-.8 1.2-1.5 1.2C9.8 20.5 3.5 14.2 3 5.9c0-.7.5-1.3 1.2-1.5Z"/>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h1"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M21 12h-3M12 21v-3M3 12h3"/></>,
    tower: <><path d="M7 21h10l-2-11H9Z"/><path d="M8 10h8l2-5H6ZM10 15h4"/></>,
    trench: <><path d="M3 8h5v4h8V8h5v11H3Z"/><path d="M8 8V5M16 8V5"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M17 11a4 4 0 0 1 4 4v2"/></>,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...common} {...props}>
      {paths[name]}
    </svg>
  );
}
