import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { MapEmbed } from "@/components/map-embed";
import { ButtonLink, Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { formatBusinessAddress } from "@/lib/business/model";
import { getPublicBusiness } from "@/lib/business/public";

export const metadata: Metadata = {
  title: "Dojazd do pola",
  description: "Mapa i informacje organizacyjne dotyczące dojazdu do Paintball Strefa 29 w Czaplach.",
  alternates: { canonical: "/dojazd" },
};

export default async function DirectionsPage() {
  const business = await getPublicBusiness();
  const address = formatBusinessAddress(business.profile);
  const mapQuery = business.profile.latitude && business.profile.longitude
    ? `${business.profile.latitude},${business.profile.longitude}`
    : address;
  return (
    <>
      <PageHero
        eyebrow="Dojazd"
        title={<>Najpierw cel. <em>Potem trasa.</em></>}
        lead={`Adres pola to ${address}. ${business.contact.directions}`}
      >
        <ButtonLink href="/zapytaj-o-termin">Zapytaj o termin</ButtonLink>
        <ButtonLink href="/kontakt" variant="ghost">Kontakt</ButtonLink>
      </PageHero>

      <section className="section section--paper">
        <Container>
          <div className="directions-layout">
            <div>
              <SectionHeading eyebrow="Punkt docelowy" title={address} body={business.profile.mapNote || business.contact.directions} />
              <div className="directions-cards">
                <article><span><Icon name="route" width={24} height={24} /></span><h3>Od strony Gdańska</h3><p>Jedź w kierunku Czapli, w okolice ul. Do Strzelenki. Ostatni zjazd dostaniesz razem z potwierdzeniem terminu.</p></article>
                <article><span><Icon name="clock" width={24} height={24} /></span><h3>Przyjedź wcześniej</h3><p>Dokładną godzinę zbiórki, odprawy i rozpoczęcia gry otrzymasz po uzgodnieniu wizyty.</p></article>
                <article><span><Icon name="map" width={24} height={24} /></span><h3>Parking i wejście</h3><p>Liczbę samochodów oraz potrzeby grupy podaj w zapytaniu. Obsługa prześle aktualne instrukcje organizacyjne.</p></article>
              </div>
            </div>
            <MapEmbed query={mapQuery} />
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
