import type { ReactNode } from "react";

import { PanelNav } from "@/components/panel/panel-nav";
import { Container } from "@/components/ui";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

export default async function StaffAreaLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff();
  return (
    <section className="section section--paper">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
          Paintball Strefa 29
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Panel pracownika</h1>
        <p className="mt-2 text-[var(--muted)]">
          Zalogowano jako {staff.name}. Zmiana statusu zgłoszenia nie potwierdza rezerwacji.
        </p>
        <div className="mt-6">
          <PanelNav staff={staff} />
        </div>
        {children}
      </Container>
    </section>
  );
}
