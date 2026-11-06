import { notFound } from "next/navigation";

import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
} from "@/lib/inquiries/model";
import { getInquiryRepository } from "@/lib/inquiries/repository";
import { can } from "@/lib/staff/permissions";
import { requireStaff } from "@/lib/staff/session";
import {
  addInquiryNote,
  assignInquiry,
  updateInquiryStatus,
} from "./actions";

export const dynamic = "force-dynamic";

function formatWhen(value: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(value);
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff("inquiries.read");
  const { id } = await params;
  const repository = getInquiryRepository();
  if (!repository) {
    return <p>Baza zgłoszeń nie jest skonfigurowana.</p>;
  }
  const inquiry = await repository.get(id);
  if (!inquiry) {
    notFound();
  }
  const staffList = can(staff.role, "inquiries.assign")
    ? await repository.listStaff()
    : [];

  return (
    <div className="grid gap-8">
      <header>
        <h2 className="text-3xl font-black">{inquiry.name}</h2>
        <p className="mt-2 text-[var(--muted)]">
          {INQUIRY_STATUS_LABELS[inquiry.status]} · wpływ {formatWhen(inquiry.createdAt)}
        </p>
        <p className="mt-2 max-w-2xl text-sm">
          Zmiana statusu oznacza tylko pracę obsługi. Nie tworzy rezerwacji i nie blokuje terminu.
        </p>
      </header>
      <dl className="grid gap-3 rounded-3xl border border-black/10 bg-white p-5 md:grid-cols-2">
        <Fact label="E-mail" value={inquiry.email} />
        <Fact label="Telefon" value={inquiry.phone || "—"} />
        <Fact label="Rodzaj wydarzenia" value={inquiry.eventType} />
        <Fact label="Liczba graczy" value={String(inquiry.playerCount)} />
        <Fact label="Preferowany termin" value={inquiry.preferredDate + " " + inquiry.preferredTime} />
        <Fact label="Termin alternatywny" value={inquiry.alternateDate || "—"} />
        <Fact label="Pakiet" value={inquiry.packageId} />
        <Fact label="Kontakt" value={inquiry.preferredContact} />
        <Fact label="Przypisany pracownik" value={inquiry.assigneeName ?? "Nieprzypisane"} />
      </dl>
      <section>
        <h3 className="text-xl font-black">Wiadomość</h3>
        <p className="mt-3 whitespace-pre-wrap rounded-3xl bg-white p-5">{inquiry.message || "—"}</p>
      </section>
      {can(staff.role, "inquiries.update") ? (
        <form action={updateInquiryStatus} className="grid max-w-md gap-3">
          <input name="id" type="hidden" value={inquiry.id} />
          <label className="grid gap-1 text-sm font-semibold">
            Status
            <select className="rounded-xl border border-black/15 px-3 py-2" name="status" defaultValue={inquiry.status}>
              {INQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {INQUIRY_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <button className="w-fit rounded-full bg-[var(--forest)] px-4 py-2 font-semibold text-white" type="submit">
            Zapisz status
          </button>
        </form>
      ) : null}
      {can(staff.role, "inquiries.assign") ? (
        <form action={assignInquiry} className="grid max-w-md gap-3">
          <input name="id" type="hidden" value={inquiry.id} />
          <label className="grid gap-1 text-sm font-semibold">
            Przypisz pracownika
            <select className="rounded-xl border border-black/15 px-3 py-2" name="assigneeId" defaultValue={inquiry.assigneeId ?? ""}>
              <option value="">Nieprzypisane</option>
              {staffList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <button className="w-fit rounded-full border border-black/15 px-4 py-2 font-semibold" type="submit">
            Zapisz przypisanie
          </button>
        </form>
      ) : null}
      <section>
        <h3 className="text-xl font-black">Prywatne notatki</h3>
        <ul className="mt-3 grid gap-3">
          {inquiry.notes.map((note) => (
            <li key={note.id} className="rounded-2xl bg-white px-4 py-3">
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {note.authorName} · {formatWhen(note.createdAt)}
              </p>
            </li>
          ))}
        </ul>
        <form action={addInquiryNote} className="mt-4 grid max-w-xl gap-3">
          <input name="id" type="hidden" value={inquiry.id} />
          <label className="grid gap-1 text-sm font-semibold" htmlFor="note-body">
            Nowa notatka
            <textarea id="note-body" name="body" required maxLength={2000} className="min-h-28 rounded-xl border border-black/15 px-3 py-2" />
          </label>
          <button className="w-fit rounded-full bg-[var(--ink)] px-4 py-2 font-semibold text-[var(--paint)]" type="submit">
            Dodaj notatkę
          </button>
        </form>
      </section>
      <section>
        <h3 className="text-xl font-black">Historia</h3>
        <ol className="mt-3 grid gap-2">
          {inquiry.history.map((entry) => (
            <li key={entry.id} className="text-sm">
              {formatWhen(entry.createdAt)} · {entry.actorName ?? "System"} · {entry.action}
              {entry.fromStatus ? " · " + entry.fromStatus + " → " + entry.toStatus : ""}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-[var(--muted)]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
