import type { ReactNode } from "react";
import { Container, PageHero } from "@/components/ui";

export function LegalPage({
  eyebrow,
  title,
  lead,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lead={lead} />
      <section className="section section--paper">
        <Container className="legal-layout">
          <aside>
            <p className="eyebrow">Status dokumentu</p>
            <strong>{updated}</strong>
            <p>Treść robocza wymaga zatwierdzenia właściciela i doradcy prawnego przed publikacją.</p>
          </aside>
          <article className="legal-copy">{children}</article>
        </Container>
      </section>
    </>
  );
}
