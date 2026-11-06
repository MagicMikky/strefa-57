import Link from "next/link";

import {
  INQUIRY_STATUS_LABELS,
  type InquiryRecord,
} from "@/lib/inquiries/model";
import { getInquiryRepository } from "@/lib/inquiries/repository";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

function formatWhen(value: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(value);
}

export default async function PanelHomePage() {
  await requireStaff("inquiries.read");
  const repository = getInquiryRepository();
  if (!repository) {
    return <p>Baza zgłoszeń nie jest skonfigurowana.</p>;
  }

  const [counts, recent, history] = await Promise.all([
    repository.counts(),
    repository.recent(5),
    repository.recentHistory(8),
  ]);

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Nowe zgłoszenia" value={counts.fresh} />
        <Stat label="W trakcie" value={counts.inProgress} />
        <Stat label="Wymagają kontaktu" value={counts.waiting} />
      </div>
      <section>
        <h2 className="text-2xl font-black">Ostatnie wiadomości</h2>
        <InquiryList items={recent} />
      </section>
      <section>
        <h2 className="text-2xl font-black">Historia aktywności</h2>
        <ul className="mt-4 grid gap-3">
          {history.length === 0 ? <li>Brak zapisanych działań.</li> : null}
          {history.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <Link href={"/panel/zgloszenia/" + entry.inquiryId}>
                {entry.action}
                {entry.toStatus ? " · " + (INQUIRY_STATUS_LABELS[entry.toStatus as keyof typeof INQUIRY_STATUS_LABELS] ?? entry.toStatus) : ""}
              </Link>
              <p className="text-sm text-[var(--muted)]">
                {entry.actorName ?? "System"} · {formatWhen(entry.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl bg-[var(--ink)] px-5 py-6 text-[var(--paper)]">
      <p className="text-sm text-[var(--sand)]">{label}</p>
      <p className="mt-2 text-4xl font-black text-[var(--paint)]">{value}</p>
    </article>
  );
}

function InquiryList({ items }: { items: InquiryRecord[] }) {
  if (items.length === 0) {
    return <p className="mt-4">Nie ma jeszcze zgłoszeń.</p>;
  }
  return (
    <ul className="mt-4 grid gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            className="block rounded-2xl border border-black/10 bg-white px-4 py-3"
            href={"/panel/zgloszenia/" + item.id}
          >
            <strong>{item.name}</strong>
            <span className="text-[var(--muted)]"> · {INQUIRY_STATUS_LABELS[item.status]}</span>
            <p className="text-sm text-[var(--muted)]">
              {item.preferredDate} · {item.playerCount} graczy · {item.eventType}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
