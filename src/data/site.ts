export type NavigationItem = {
  href: string;
  label: string;
};

export type OfferPackage = {
  id: string;
  name: string;
  eyebrow: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const siteConfig = {
  name: "Paintball Strefa 29",
  shortName: "Strefa 29",
  description:
    "Terenowe pole paintballowe w Czaplach koło Gdańska. Okopy, bunkry, ambony i scenariusz z rakietą V2.",
  address: {
    street: "Żurawia 29",
    postalCode: "80-298",
    city: "Czaple",
    region: "pomorskie",
    country: "PL",
    directionsNote: "Dokładną instrukcję wjazdu otrzymasz po uzgodnieniu terminu.",
  },
  contact: {
    phoneDisplay: "Numer telefonu do potwierdzenia",
    phoneHref: "",
    emailDisplay: "E-mail do potwierdzenia",
    emailHref: "",
    hours: "Gry i kontakt po wcześniejszym uzgodnieniu",
  },
  social: {
    facebook: "",
    instagram: "",
  },
} as const;

export const mainNavigation: NavigationItem[] = [
  { href: "/oferta", label: "Oferta" },
  { href: "/cennik", label: "Cennik" },
  { href: "/galeria", label: "Galeria" },
  { href: "/dla-kogo", label: "Dla kogo" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
];

export const stats = [
  { value: "1+ ha", label: "terenu do gry" },
  { value: "4", label: "proponowane pory startu" },
  { value: "15 km", label: "od centrum Gdańska" },
  { value: "V2", label: "unikalny scenariusz" },
] as const;

export const attractions = [
  {
    icon: "target",
    title: "Rakieta V2",
    description:
      "Scenariusz drużynowy z aktywacją, odliczaniem i finałem, który wymaga współpracy pod presją czasu.",
  },
  {
    icon: "trench",
    title: "Okopy i bunkry",
    description:
      "System osłon, worków z piaskiem i przejść pozwala planować natarcie, obronę i flankowanie.",
  },
  {
    icon: "tower",
    title: "Ambony i przewyższenia",
    description:
      "Punkty obserwacyjne zmieniają dynamikę rozgrywki i nagradzają dobrą komunikację w zespole.",
  },
  {
    icon: "forest",
    title: "Naturalny teren",
    description:
      "Ponad hektar otwartej i zalesionej przestrzeni z przeszkodami, które nie wyglądają jak hala sportowa.",
  },
] as const;

export const packages: OfferPackage[] = [
  {
    id: "pierwsza-misja",
    name: "Pierwsza misja",
    eyebrow: "Dobry start",
    price: "Wycena po zapytaniu",
    description:
      "Kompletny zestaw na pierwszą rozgrywkę — bez zgadywania, czego potrzebuje grupa.",
    features: [
      "marker, maska i butla",
      "pakiet startowy kulek",
      "odprawa i opieka prowadzącego",
      "dostęp do scenariuszy pola",
    ],
  },
  {
    id: "pelne-natarcie",
    name: "Pełne natarcie",
    eyebrow: "Najczęstszy wybór",
    price: "Wycena po zapytaniu",
    description:
      "Więcej amunicji i swobody dla ekip, które chcą rozegrać kilka intensywnych scenariuszy.",
    features: [
      "pełne wyposażenie gracza",
      "zwiększony pakiet kulek",
      "kilka rund i scenariuszy",
      "prowadzenie całego wydarzenia",
    ],
    featured: true,
  },
  {
    id: "wydarzenie",
    name: "Wydarzenie grupowe",
    eyebrow: "Firmy i okazje",
    price: "Wycena indywidualna",
    description:
      "Elastyczny wariant dla integracji, urodzin, szkół i większych grup z dodatkami organizacyjnymi.",
    features: [
      "program dopasowany do grupy",
      "możliwość dodatkowych scenariuszy",
      "ustalenia dotyczące ogniska lub cateringu",
      "oferta i dokument sprzedaży dla firmy",
    ],
  },
];

export const addOns = [
  "dodatkowe kulki",
  "rękawice ochronne",
  "kombinezon",
  "granaty dymne — po potwierdzeniu dostępności",
  "ognisko lub catering — po indywidualnym uzgodnieniu",
] as const;

export const audiences = [
  {
    slug: "znajomi",
    number: "01",
    title: "Ekipa znajomych",
    description:
      "Zamień zwykłe spotkanie w terenową misję, o której będziecie rozmawiać jeszcze długo po ostatniej rundzie.",
    prompt: "Chcemy zagrać ze znajomymi",
  },
  {
    slug: "urodziny",
    number: "02",
    title: "Urodziny i okazje",
    description:
      "Scenariusze dopasowane do charakteru grupy, jasny plan dnia i możliwość uzgodnienia dodatkowego zaplecza.",
    prompt: "Organizuję urodziny",
  },
  {
    slug: "kawalerskie",
    number: "03",
    title: "Kawalerskie i panieńskie",
    description:
      "Dynamiczna rywalizacja, wyrazisty finał z rakietą V2 i format, który angażuje całą ekipę.",
    prompt: "Organizuję imprezę dla ekipy",
  },
  {
    slug: "firmy",
    number: "04",
    title: "Firmy i integracje",
    description:
      "Zadania oparte na komunikacji i współpracy, z ofertą przygotowaną pod liczebność i potrzeby organizacyjne firmy.",
    prompt: "Proszę o ofertę firmową",
  },
  {
    slug: "szkoly",
    number: "05",
    title: "Szkoły i grupy",
    description:
      "Wariant wymagający wcześniejszego potwierdzenia wieku uczestników, opieki i zasad bezpieczeństwa.",
    prompt: "Pytam o grupę zorganizowaną",
  },
] as const;

export const visitSteps = [
  {
    number: "01",
    title: "Przyjazd i odprawa",
    description:
      "Przyjedźcie wcześniej. Prowadzący omówi zasady, teren i bezpieczne korzystanie ze sprzętu.",
  },
  {
    number: "02",
    title: "Dobór wyposażenia",
    description:
      "Każdy gracz otrzymuje dopasowaną maskę i marker. Przed startem wykonujemy próbę sprzętu.",
  },
  {
    number: "03",
    title: "Misje na polu",
    description:
      "Drużyny rozgrywają kolejne scenariusze, wykorzystując okopy, bunkry, ambony i naturalne osłony.",
  },
  {
    number: "04",
    title: "Finał i podsumowanie",
    description:
      "Kończymy mocnym scenariuszem, oddajemy sprzęt i zostawiamy czas na spokojne podsumowanie spotkania.",
  },
] as const;

export const faqItems: FaqItem[] = [
  {
    question: "Czy wysłanie formularza rezerwuje termin?",
    answer:
      "Nie. Formularz przesyła zapytanie z preferowanym terminem. Obsługa najpierw sprawdza możliwość organizacji gry, potwierdza cenę i kontaktuje się z organizatorem. Dopiero osobne potwierdzenie oznacza uzgodnienie wizyty.",
  },
  {
    question: "Ile osób może zagrać?",
    answer:
      "Podaj liczbę uczestników w formularzu. Obsługa zaproponuje właściwy wariant i poinformuje, czy grupę można połączyć z inną albo zagrać samodzielnie.",
  },
  {
    question: "Ile trwa wizyta?",
    answer:
      "Czas zależy od wybranego pakietu, liczby graczy i scenariuszy. Do czasu gry trzeba doliczyć wcześniejszy przyjazd, odprawę bezpieczeństwa i dobór sprzętu. Dokładny plan otrzymasz razem z potwierdzeniem.",
  },
  {
    question: "Czy można grać podczas deszczu?",
    answer:
      "Lekki deszcz zwykle nie odbiera frajdy z gry terenowej, ale ostateczna decyzja zależy od warunków i bezpieczeństwa. Zasady przełożenia wydarzenia obsługa potwierdzi przed uzgodnieniem terminu.",
  },
  {
    question: "Jak się ubrać?",
    answer:
      "Wybierz wygodne ubranie, które może się ubrudzić, oraz stabilne obuwie terenowe. Długie rękawy i nogawki zwiększają komfort. Dostępność kombinezonów i rękawic potwierdzi obsługa.",
  },
  {
    question: "Czy osoby niepełnoletnie mogą zagrać?",
    answer:
      "Minimalny wiek i forma zgody opiekuna zależą od zasad obiektu. W zapytaniu zaznacz, że grupa obejmuje osoby niepełnoletnie — obsługa poda aktualne zasady.",
  },
  {
    question: "Czy na miejscu jest parking i zaplecze?",
    answer:
      "Przy zapytaniu warto podać wielkość grupy i potrzeby organizacyjne. Szczegóły dotyczące parkingu, toalet, miejsca dla osób towarzyszących, ogniska i cateringu zostaną potwierdzone przed wizytą.",
  },
  {
    question: "Jak wygląda płatność?",
    answer:
      "W wersji 1.0 strona nie obsługuje płatności. Po sprawdzeniu terminu obsługa przekazuje cenę, wysokość ewentualnego zadatku i sposób jego wpłaty. Nie wysyłaj danych karty przez formularz ani e-mail.",
  },
];

export const galleryItems = [
  { title: "Pole", label: "Ponad hektar terenu", tone: "forest" },
  { title: "Okopy", label: "Podejścia i zasłony", tone: "sand" },
  { title: "Bunkier", label: "Punkt obronny", tone: "graphite" },
  { title: "Rakieta V2", label: "Scenariusz finałowy", tone: "paint" },
  { title: "Ambony", label: "Widok na pole", tone: "forest" },
  { title: "Zaplecze", label: "Start i odprawa", tone: "sand" },
] as const;

const audienceEventTypes = {
  znajomi: "znajomi",
  urodziny: "urodziny",
  kawalerskie: "kawalerskie-panienskie",
  firmy: "firma",
  szkoly: "szkola",
} as const;

export function eventTypeForAudience(slug: string | undefined): string {
  if (!slug) {
    return "";
  }

  if (slug in audienceEventTypes) {
    return audienceEventTypes[slug as keyof typeof audienceEventTypes];
  }

  return slug;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export function formatAddress() {
  const { street, postalCode, city } = siteConfig.address;
  return `${street}, ${postalCode} ${city}`;
}
