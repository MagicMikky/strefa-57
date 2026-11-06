import { AvailabilityCalendar } from "@/components/availability-calendar";
import { warsawDate } from "@/lib/availability/model";
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
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Dostępność</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Widok liczy opublikowaną pojemność i niewygasłe blokady. Nie tworzy rezerwacji, ceny ani płatności.
        </p>
      </div>
      <AvailabilityCalendar
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
