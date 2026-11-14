import { createPhoneBookingAction, updatePhoneBookingAction, cancelPhoneBookingAction } from "./actions";
import { warsawDate } from "@/lib/availability/model";
import { getPublicBusiness } from "@/lib/business/public";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";
const input = "mt-1 w-full rounded-xl border border-black/20 bg-white px-3 py-2 text-sm";

function Fields({ booking, times, min, max, today }: {
  booking?: { date: string; slot: string; players: number; privateSlot: boolean; contactName: string | null; contactPhone: string | null; notes: string | null };
  times: string[]; min: number; max: number; today: string;
}) {
  return <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Imię lub nazwa kontaktu<input className={input} name="contactName" maxLength={100} defaultValue={booking?.contactName ?? ""} required /></label>
    <label className="text-sm font-semibold">Telefon<input className={input} name="contactPhone" type="tel" maxLength={30} defaultValue={booking?.contactPhone ?? ""} required /></label>
    <label className="text-sm font-semibold">Data<input className={input} name="date" type="date" min={today} defaultValue={booking?.date ?? today} required /></label>
    <label className="text-sm font-semibold">Godzina<select className={input} name="slot" defaultValue={booking?.slot ?? times[0]} required>{times.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
    <label className="text-sm font-semibold">Liczba osób<input className={input} name="players" type="number" min={min} max={max} defaultValue={booking?.players ?? min} required /></label>
    <label className="text-sm font-semibold">Tryb<select className={input} name="mode" defaultValue={booking?.privateSlot === false ? "shared" : "private"}><option value="private">Na wyłączność</option><option value="shared">Mogą dołączyć inni</option></select></label>
    <label className="text-sm font-semibold sm:col-span-2">Notatka dla pracowników<textarea className={`${input} min-h-20`} name="notes" maxLength={1000} defaultValue={booking?.notes ?? ""} /></label>
  </div>;
}

export default async function PhoneBookingsPage({ searchParams }: { searchParams: Promise<{ error?: string; result?: string }> }) {
  await requireStaff("inquiries.update");
  const query = await searchParams;
  if (!process.env.DATABASE_URL) return <p role="alert">Baza danych nie jest skonfigurowana.</p>;
  const db = getPrisma();
  const business = await getPublicBusiness();
  const today = warsawDate();
  const bookings = await db.confirmedSlot.findMany({ where: { source: "phone", date: { gte: today } }, orderBy: [{ date: "asc" }, { slot: "asc" }], take: 150 });
  const history = await db.staffAudit.findMany({ where: { targetId: { in: bookings.map((item) => item.id) }, action: { startsWith: "phone_booking_" } }, orderBy: { createdAt: "desc" }, take: 300, include: { actor: { select: { name: true } } } });
  return <section className="grid gap-6">
    <div><h2 className="text-3xl font-black">Rezerwacje telefoniczne</h2><p className="mt-2 text-sm text-black/70">Wpisanie potwierdzonej wizyty od razu aktualizuje dostępność. Dane kontaktowe widzą tylko pracownicy.</p></div>
    {query.error ? <p className="rounded-xl bg-red-50 p-4 text-red-900" role="alert">{query.error}</p> : null}
    {query.result ? <p className="rounded-xl bg-emerald-50 p-4 text-emerald-900" role="status">{query.result === "cancelled" ? "Rezerwacja anulowana." : query.result === "updated" ? "Rezerwacja zmieniona." : "Rezerwacja dodana."}</p> : null}
    <form action={createPhoneBookingAction} className="grid gap-4 rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-black">Dodaj rezerwację po rozmowie</h3>
      <Fields times={business.settings.slotStartTimes} min={business.settings.minPlayersPerBooking} max={business.settings.maxPlayersPerSlot} today={today} />
      <button className="w-fit rounded-full bg-[var(--forest)] px-5 py-3 font-semibold text-white" type="submit">Zapisz i zajmij termin</button>
    </form>
    <div className="grid gap-4"><h3 className="text-xl font-black">Nadchodzące wpisy</h3>
      {bookings.length === 0 ? <p>Nie ma jeszcze rezerwacji telefonicznych.</p> : bookings.map((booking) => <article className="rounded-3xl border border-black/10 bg-white p-5" key={booking.id}>
        <h4 className="text-lg font-bold">{booking.date} · {booking.slot} · {booking.cancelledAt ? "Anulowana" : booking.privateSlot ? "Na wyłączność" : "Wspólna"}</h4>
        <p className="mt-1 text-sm">{booking.contactName} · {booking.contactPhone} · {booking.players} osób</p>
        {booking.notes ? <p className="mt-2 whitespace-pre-wrap text-sm text-black/70">{booking.notes}</p> : null}
        {!booking.cancelledAt ? <div className="mt-4 grid gap-3">
          <details><summary className="cursor-pointer font-semibold">Zmień rezerwację</summary><form action={updatePhoneBookingAction} className="mt-4 grid gap-4"><input name="id" type="hidden" value={booking.id} /><Fields booking={booking} times={business.settings.slotStartTimes} min={business.settings.minPlayersPerBooking} max={business.settings.maxPlayersPerSlot} today={today} /><button className="w-fit rounded-full border border-black/20 px-5 py-2 font-semibold" type="submit">Zapisz zmiany</button></form></details>
          <form action={cancelPhoneBookingAction}><input name="id" type="hidden" value={booking.id} /><button className="rounded-full border border-red-300 px-5 py-2 font-semibold text-red-900" type="submit">Anuluj rezerwację</button></form>
        </div> : null}
        <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">Historia działań</summary><ul className="mt-2 grid gap-1">{history.filter((item) => item.targetId === booking.id).map((item) => <li key={item.id}>{item.createdAt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })} · {item.actor?.name ?? "Pracownik"} · {item.action.split(":")[0]}</li>)}</ul></details>
      </article>)}
    </div>
  </section>;
}
