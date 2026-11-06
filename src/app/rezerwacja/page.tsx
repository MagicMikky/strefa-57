import type { Metadata } from "next";

import { AvailabilityCalendar } from "@/components/availability-calendar";
import { Container, PageHero } from "@/components/ui";
import { warsawDate } from "@/lib/availability/model";
import { getPublicBusiness } from "@/lib/business/public";
import { getPublishedSchedule } from "@/lib/schedule/public";

export const metadata: Metadata = {
  title: "Dostępność terminów",
  description: "Sprawdź orientacyjną dostępność dni i slotów. Ten widok nie tworzy rezerwacji ani płatności.",
  alternates: { canonical: "/rezerwacja" },
};

export default async function AvailabilityPage() {
  const [business, schedule] = await Promise.all([getPublicBusiness(), getPublishedSchedule()]);
  const { settings } = business;
  return (
    <>
      <PageHero
        eyebrow="Dostępność"
        title={<>Sprawdź dzień. <em>Potem wyślij zapytanie.</em></>}
        lead="Kolory liczą opublikowaną pojemność i blokady właściciela. Nie ma tu cen, zadatku ani potwierdzenia terminu."
      />
      <section className="section">
        <Container>
          <AvailabilityCalendar
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
