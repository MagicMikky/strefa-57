import type { Metadata } from "next";
import { InfoNotice } from "@/components/content";
import { Icon } from "@/components/icons";
import { MapEmbed } from "@/components/map-embed";
import { ButtonLink, Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { formatAddress } from "@/data/site";

export const metadata: Metadata = {
  title: "Dojazd do pola",
  description: "Mapa i informacje organizacyjne dotyczące dojazdu do Paintball Strefa 29 w Czaplach.",
  alternates: { canonical: "/dojazd" },
};

export default function DirectionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Dojazd"
        title={<>Najpierw cel. <em>Potem trasa.</em></>}
        lead={`Adres wskazany w planie to ${formatAddress()}. Przed wyjazdem zaczekaj na potwierdzenie terminu i dokładne instrukcje wjazdu.`}
      >
        <ButtonLink href="/zapytaj-o-termin">Zapytaj o termin</ButtonLink>
        <ButtonLink href="/kontakt" variant="ghost">Kontakt</ButtonLink>
      </PageHero>

      <section className="section section--paper">
        <Container>
          <div className="directions-layout">
            <div>
              <SectionHeading eyebrow="Punkt docelowy" title={formatAddress()} body="Czaple, gmina Żukowo, w sąsiedztwie Gdańska. Dokładny pin lokalizacji pola musi zatwierdzić właściciel." />
              <div className="directions-cards">
                <article><span><Icon name="route" width={24} height={24} /></span><h3>Od strony Gdańska</h3><p>Jedź w kierunku Czapli. Nazwa występująca w oficjalnych materiałach gminy to ul. Do Strzelenki; właściwy zjazd wymaga potwierdzenia.</p></article>
                <article><span><Icon name="clock" width={24} height={24} /></span><h3>Przyjedź wcześniej</h3><p>Dokładną godzinę zbiórki, odprawy i rozpoczęcia gry otrzymasz po uzgodnieniu wizyty.</p></article>
                <article><span><Icon name="map" width={24} height={24} /></span><h3>Parking i wejście</h3><p>Liczbę samochodów oraz potrzeby grupy podaj w zapytaniu. Obsługa prześle aktualne instrukcje organizacyjne.</p></article>
              </div>
            </div>
            <MapEmbed />
          </div>
          <div className="content-spacer">
            <InfoNotice title="Nie ruszaj bez potwierdzenia">
              Publiczne źródła potwierdzają istnienie adresu, ale nie potwierdzają jednoznacznie lokalizacji pola. Przed publikacją potrzebny jest oficjalny pin mapy i instrukcja ostatniego odcinka trasy.
            </InfoNotice>
          </div>
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
