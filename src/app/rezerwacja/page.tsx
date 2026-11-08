import type { Metadata } from "next";

import { AvailabilityCalendar } from "@/components/availability-calendar";
import { Container, PageHero } from "@/components/ui";
import { warsawDate } from "@/lib/availability/model";
import { getPublicBusiness } from "@/lib/business/public";
import { getPublicConfirmedSlots } from "@/lib/confirmed-slots/public";
import { getPublicCapacityHolds } from "@/lib/holds/public";
import { getPublishedSchedule } from "@/lib/schedule/public";

export const metadata: Metadata = {
  title: "Dostępność terminów",
  description: "Sprawdź orientacyjną dostępność dni i slotów. Ten widok nie tworzy rezerwacji ani płatności.",
  alternates: { canonical: "/rezerwacja" },
};

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const [business, schedule, capacity, confirmed] = await Promise.all([getPublicBusiness(), getPublishedSchedule(), getPublicCapacityHolds(), getPublicConfirmedSlots(warsawDate())]);
  const { settings } = business;
  return (
    <>
      <PageHero
        eyebrow="Dostępność"
        title={<>Sprawdź dzień. <em>Potem wyślij zapytanie.</em></>}
        lead="Sprawdź dostępne godziny i potwierdzone wizyty. Wysłanie zapytania nie zajmuje terminu."
      />
      <section className="section">
        <Container>
          <AvailabilityCalendar
            capacityKnown={Boolean(process.env.DATABASE_URL) && capacity.known && confirmed.known}
            confirmedSlots={confirmed.slots}
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
        </Container>
      </section>
    </>
  );
}
