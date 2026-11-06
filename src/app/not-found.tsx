import { ButtonLink, Container, TacticalMark } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="not-found">
      <Container className="not-found__inner">
        <div>
          <p className="eyebrow eyebrow--light">Błąd 404</p>
          <h1>Ta ścieżka wyszła poza pole.</h1>
          <p>Nie znaleźliśmy strony pod tym adresem. Wróć do bazy albo przejdź prosto do zapytania.</p>
          <div className="button-row">
            <ButtonLink href="/">Strona główna</ButtonLink>
            <ButtonLink href="/zapytaj-o-termin" variant="ghost">Zapytaj o termin</ButtonLink>
          </div>
        </div>
        <TacticalMark />
      </Container>
    </section>
  );
}
