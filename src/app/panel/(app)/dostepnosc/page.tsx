import { AvailabilityCalendar } from "@/components/availability-calendar";
import { warsawDate } from "@/lib/availability/model";
import { checkoutReadiness } from "@/lib/business/checkout-gate";
import { getPublicBusiness } from "@/lib/business/public";
import { getPublicCapacityHolds } from "@/lib/holds/public";
import { getPublishedSchedule } from "@/lib/schedule/public";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

export default async function PanelAvailabilityPage() {
  await requireStaff("business.publish");
  const [business, schedule, capacity] = await Promise.all([
    getPublicBusiness(),
    getPublishedSchedule(),
    getPublicCapacityHolds(),
  ]);
  const { settings } = business;
  const checkout = checkoutReadiness();
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Dostępność</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Widok liczy opublikowaną pojemność i niewygasłe blokady. Nie tworzy rezerwacji, ceny ani płatności.
        </p>
      </div>
      <div className="rounded-2xl border border-black/10 p-4">
        <h2 className="text-lg font-black">Sprzedaż online jest wyłączona</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {checkout.missing.map((item) => (
            <li key={item.id}>{item.id}: {item.label}</li>
          ))}
        </ul>
      </div>
      <AvailabilityCalendar
        allowPast
        showOperations
        capacityKnown={capacity.known}
        holds={capacity.holds}
        schedule={schedule}
        settings={{
          maxPlayersPerTeam: settings.maxPlayersPerTeam,
          maxTeamsPerMatch: settings.maxTeamsPerMatch,
          maxPlayersPerSlot: settings.maxPlayersPerSlot,
          slotStartTimes: settings.slotStartTimes,
          slotDurationMinutes: settings.slotDurationMinutes,
        }}
        today={warsawDate()}
      />
    </section>
  );
}
