import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow${light ? " eyebrow--light" : ""}`}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  light = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={`section-heading section-heading--${align}${light ? " section-heading--light" : ""}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  icon = "arrow",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  icon?: IconName | null;
  className?: string;
}) {
  return (
    <Link className={`button button--${variant} ${className}`} href={href}>
      <span>{children}</span>
      {icon ? <Icon name={icon} width={19} height={19} /> : null}
    </Link>
  );
}

export function FeatureCard({
  icon,
  title,
  children,
  index,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  index?: string;
}) {
  return (
    <article className="feature-card">
      <div className="feature-card__top">
        <span className="icon-tile"><Icon name={icon} width={25} height={25} /></span>
        {index ? <span className="feature-card__index">{index}</span> : null}
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="page-hero__grid" aria-hidden="true" />
      <Container className="page-hero__inner">
        <div className="page-hero__copy">
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p>{lead}</p>
          {children ? <div className="button-row">{children}</div> : null}
        </div>
        <TacticalMark compact />
      </Container>
    </section>
  );
}

export function TacticalMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`tactical-mark${compact ? " tactical-mark--compact" : ""}`} aria-hidden="true">
      <Image
        src="/logo.png"
        alt=""
        width={900}
        height={900}
        sizes={compact ? "(max-width: 768px) 45vw, 450px" : "(max-width: 768px) 35vw, 410px"}
        priority
      />
    </div>
  );
}

export function CtaBand({
  eyebrow = "Gotowi wejść do gry?",
  title = "Najpierw sprawdźmy, co pasuje do Twojej ekipy.",
  body = "Podaj preferowany termin i liczbę graczy. To zapytanie — obsługa potwierdzi dostępność i cenę przed ustaleniem wizyty.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="cta-band">
      <Container className="cta-band__inner">
        <div>
          <Eyebrow light>{eyebrow}</Eyebrow>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="button-row">
          <ButtonLink href="/zapytaj-o-termin" variant="light">Zapytaj o wolny termin</ButtonLink>
          <ButtonLink href="/kontakt" variant="ghost" icon="phone">Kontakt</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
