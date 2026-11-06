import Link from "next/link";
import { FaqList, MissionPanel, NumberedSteps, PackageCard } from "@/components/content";
import { Icon } from "@/components/icons";
import { ButtonLink, Container, CtaBand, Eyebrow, FeatureCard, SectionHeading, TacticalMark } from "@/components/ui";
import { attractions, audiences, faqItems, packages, stats, visitSteps } from "@/data/site";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__grid" aria-hidden="true" />
        <Container className="home-hero__inner">
          <div className="home-hero__copy">
            <Eyebrow light>Paintball terenowy · Czaple</Eyebrow>
            <h1>Wejdź do <em>strefy.</em><br />Zagraj o każdy metr.</h1>
            <p>
              Okopy, bunkry, ambony i scenariusz z rakietą V2. Zbierz ekipę i sprawdź, jak działa współpraca pod presją.
            </p>
            <div className="button-row">
              <ButtonLink href="/zapytaj-o-termin">Zapytaj o wolny termin</ButtonLink>
              <ButtonLink href="/oferta" variant="ghost">Zobacz pole</ButtonLink>
            </div>
            <p className="home-hero__disclaimer"><Icon name="shield" width={17} height={17} /> Zapytanie nie blokuje terminu. Dostępność potwierdzi obsługa.</p>
          </div>
          <div className="home-hero__visual">
            <TacticalMark />
            <div className="coordinate-tag"><span>54°N</span><span>18°E</span><strong>STREFA 29</strong></div>
          </div>
        </Container>
        <div className="hero-ticker" aria-label="Najważniejsze elementy pola">
          <div>
            <span>OKOPY</span><i />
            <span>BUNKRY</span><i />
            <span>RAKIETA V2</span><i />
            <span>AMBONY</span><i />
            <span>TEREN 1+ HA</span><i />
            <span>OKOPY</span><i />
            <span>BUNKRY</span>
          </div>
        </div>
      </section>

      <section className="stats-strip" aria-label="Strefa 29 w liczbach">
        <Container className="stats-strip__grid">
          {stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </Container>
      </section>

      <section className="section section--paper">
        <Container>
          <div className="heading-row">
            <SectionHeading
              eyebrow="To nie jest płaskie boisko"
              title="Teren, który wymusza taktykę."
              body="Każdy element pola daje inne możliwości. Znajdź osłonę, utrzymaj pozycję i komunikuj się, zanim zrobi to druga drużyna."
            />
            <Link className="text-link" href="/oferta">Poznaj pełną ofertę <Icon name="arrow" width={18} height={18} /></Link>
          </div>
          <div className="feature-grid">
            {attractions.map((item, index) => (
              <FeatureCard key={item.title} icon={item.icon as Parameters<typeof Icon>[0]["name"]} title={item.title} index={`0${index + 1}`}>
                {item.description}
              </FeatureCard>
            ))}
          </div>
        </Container>
      </section>

      <section className="section section--dark mission-section">
        <Container className="split split--mission">
          <div>
            <SectionHeading
              eyebrow="Misja specjalna"
              title="Rakieta V2 zmienia finał gry."
              body="Jedna drużyna próbuje uruchomić sekwencję. Druga ma dziesięć minut, by przerwać odliczanie. Ostatnie chwile rozgrywki wymagają chłodnej głowy i dobrego podziału ról."
              light
            />
            <ul className="check-list check-list--light">
              <li><Icon name="check" width={18} height={18} /> aktywacja przez utrzymanie pozycji</li>
              <li><Icon name="check" width={18} height={18} /> wyraźne odliczanie do finału</li>
              <li><Icon name="check" width={18} height={18} /> scenariusz oparty na współpracy</li>
            </ul>
            <ButtonLink href="/oferta#rakieta-v2" variant="ghost">Jak działa scenariusz</ButtonLink>
          </div>
          <MissionPanel />
        </Container>
      </section>

      <section className="section section--cream">
        <Container>
          <SectionHeading
            eyebrow="Wybierz poziom wejścia"
            title="Pakiet dopasowany do tempa ekipy."
            body="Poniższe warianty pokazują planowaną strukturę oferty. Końcową zawartość, ceny i dostępność dodatków potwierdzi obsługa przed uzgodnieniem wizyty."
            align="center"
          />
          <div className="package-grid">
            {packages.map((item) => <PackageCard key={item.id} item={item} />)}
          </div>
          <p className="section-footnote">Cennik jest obecnie przygotowywany do zatwierdzenia. Strona nie pobiera płatności online.</p>
        </Container>
      </section>

      <section className="section section--paper">
        <Container>
          <SectionHeading
            eyebrow="Jeden teren, różne okazje"
            title="Zbierz ludzi. Resztę dopasujemy."
            body="Inaczej wygląda pierwsza gra ze znajomymi, inaczej integracja firmy. W zapytaniu opisz grupę — pomożemy dobrać tempo i scenariusze."
          />
          <div className="audience-list">
            {audiences.map((item) => (
              <Link key={item.slug} href={`/zapytaj-o-termin?wydarzenie=${item.slug}`}>
                <span>{item.number}</span>
                <div><h3>{item.title}</h3><p>{item.description}</p></div>
                <Icon name="arrow" width={23} height={23} />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="section section--sand">
        <Container className="split split--steps">
          <div>
            <SectionHeading
              eyebrow="Od przyjazdu do ostatniej rundy"
              title="Wiesz, co dzieje się dalej."
              body="Dobra organizacja zaczyna się przed pierwszym strzałem. Dokładne godziny i długość wydarzenia obsługa potwierdzi dla wybranego wariantu."
            />
            <ButtonLink href="/faq" variant="secondary">Przeczytaj FAQ</ButtonLink>
          </div>
          <NumberedSteps items={visitSteps} />
        </Container>
      </section>

      <section className="section section--paper">
        <Container className="faq-preview">
          <div>
            <SectionHeading
              eyebrow="Przed kontaktem"
              title="Najczęstsze pytania"
              body="Nie znalazłeś odpowiedzi? Wyślij zapytanie — bez zobowiązań i bez zakładania konta."
            />
            <ButtonLink href="/faq" variant="secondary">Wszystkie odpowiedzi</ButtonLink>
          </div>
          <FaqList items={faqItems} limit={4} />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
