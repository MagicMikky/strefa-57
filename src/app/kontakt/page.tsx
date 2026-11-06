import type { Metadata } from "next";
import { InfoNotice } from "@/components/content";
import { Icon } from "@/components/icons";
import { MapEmbed } from "@/components/map-embed";
import { ButtonLink, Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { formatAddress, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt i dojazd do Paintball Strefa 29 w Czaplach koło Gdańska.",
};

export default function ContactPage() {
  const phoneReady = Boolean(siteConfig.contact.phoneHref);
  const emailReady = Boolean(siteConfig.contact.emailHref);

  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title={<>Masz ekipę? <em>Ustalmy szczegóły.</em></>}
        lead="Najpierw wyślij preferowany termin i liczbę graczy. Obsługa sprawdzi możliwości i wróci z ceną oraz dalszymi krokami."
      >
        <ButtonLink href="/zapytaj-o-termin">Wyślij zapytanie</ButtonLink>
        <ButtonLink href="/dojazd" variant="ghost" icon="route">Sprawdź dojazd</ButtonLink>
      </PageHero>

      <section className="section section--paper">
        <Container>
          <SectionHeading
            eyebrow="Wybierz wygodną drogę"
            title="Zapytanie online albo kontakt bezpośredni."
            body="Wersja 1.0 nie pokazuje dostępności na żywo. Każdy termin i końcową cenę potwierdza obsługa."
          />
          <div className="contact-grid">
            <article className="contact-card contact-card--primary">
              <span><Icon name="calendar" width={27} height={27} /></span>
              <p className="contact-card__eyebrow">Najwięcej informacji od razu</p>
              <h2>Zapytaj o wolny termin</h2>
              <p>Podaj datę, liczbę graczy i rodzaj wydarzenia. Formularz nie blokuje miejsca.</p>
              <ButtonLink href="/zapytaj-o-termin" variant="light">Przejdź do formularza</ButtonLink>
            </article>
            <article className="contact-card">
              <span><Icon name="phone" width={27} height={27} /></span>
              <p className="contact-card__eyebrow">Telefon</p>
              <h2>{siteConfig.contact.phoneDisplay}</h2>
              <p>{siteConfig.contact.hours}. Numer musi zostać potwierdzony przez właściciela przed uruchomieniem.</p>
              {phoneReady ? <a className="text-link" href={siteConfig.contact.phoneHref}>Zadzwoń <Icon name="arrow" width={18} height={18} /></a> : <span className="contact-card__pending">Dane oczekują na zatwierdzenie</span>}
            </article>
            <article className="contact-card">
              <span><Icon name="mail" width={27} height={27} /></span>
              <p className="contact-card__eyebrow">E-mail</p>
              <h2>{siteConfig.contact.emailDisplay}</h2>
              <p>Adres publiczny i skrzynka odbierająca formularz muszą należeć do firmy.</p>
              {emailReady ? <a className="text-link" href={siteConfig.contact.emailHref}>Napisz e-mail <Icon name="arrow" width={18} height={18} /></a> : <span className="contact-card__pending">Dane oczekują na zatwierdzenie</span>}
            </article>
          </div>

          <div className="content-spacer">
            <InfoNotice title="Dane kontaktowe są blockerem publikacji">
              Nie udało się potwierdzić oficjalnego telefonu, e-maila ani godzin kontaktu. Aplikacja celowo nie publikuje danych innej firmy ani wartości przykładowych.
            </InfoNotice>
          </div>
        </Container>
      </section>

      <section className="section section--cream">
        <Container className="contact-location">
          <div>
            <SectionHeading eyebrow="Lokalizacja z planu" title={formatAddress()} body="Dokładny punkt wjazdu i powiązanie adresu z polem wymagają ostatecznego potwierdzenia właściciela." />
            <ul className="contact-facts">
              <li><Icon name="map" width={21} height={21} /><span><strong>Adres</strong>{formatAddress()}</span></li>
              <li><Icon name="route" width={21} height={21} /><span><strong>Wskazówka</strong>Okolice ul. Do Strzelenki — dokładny wjazd do potwierdzenia</span></li>
              <li><Icon name="clock" width={21} height={21} /><span><strong>Przyjazd</strong>Godzinę zbiórki potwierdzi obsługa</span></li>
            </ul>
          </div>
          <MapEmbed />
        </Container>
      </section>
      <CtaBand />
    </>
  );
}
