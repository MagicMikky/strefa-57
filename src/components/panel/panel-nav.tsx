import Link from "next/link";

import { logoutStaff } from "@/app/panel/(app)/actions";
import { can } from "@/lib/staff/permissions";
import type { StaffSession } from "@/lib/staff/session";

export function PanelNav({ staff }: { staff: StaffSession }) {
  return (
    <nav aria-label="Nawigacja panelu" className="mb-8 flex flex-wrap items-center gap-3 text-sm font-semibold">
      <Link className="rounded-full bg-[var(--ink)] px-4 py-2 text-[var(--paint)]" href="/panel">
        Pulpit
      </Link>
      <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/zgloszenia">
        Zgłoszenia
      </Link>
      {can(staff.role, "staff.manage") ? (
        <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/pracownicy">
          Pracownicy
        </Link>
      ) : null}
      {can(staff.role, "business.publish") ? (
        <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/firma">
          Firma
        </Link>
      ) : null}
      {can(staff.role, "business.publish") ? (
        <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/tresci">
          Treści
        </Link>
      ) : null}
      {can(staff.role, "business.publish") ? (
        <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/galeria">
          Galeria
        </Link>
      ) : null}
      {can(staff.role, "business.publish") ? (
        <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/harmonogram">
          Harmonogram
        </Link>
      ) : null}
      <Link className="rounded-full border border-black/15 px-4 py-2" href="/panel/ustawienia">
        Ustawienia
      </Link>
      <form action={logoutStaff}>
        <button className="rounded-full border border-black/15 px-4 py-2" type="submit">
          Wyloguj
        </button>
      </form>
    </nav>
  );
}
