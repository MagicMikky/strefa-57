import { attractions, faqItems, packages, siteConfig, type OfferPackage } from "@/data/site";
import { plainText } from "@/lib/business/model";

export interface SeoFields {
  title: string;
  description: string;
}

export interface SiteCopy {
  seo: {
    home: SeoFields;
    faq: SeoFields;
    oferta: SeoFields;
    cennik: SeoFields;
  };
  faq: Array<{ question: string; answer: string }>;
  attractions: Array<{ title: string; description: string }>;
  packages: Array<{
    id: string;
    name: string;
    eyebrow: string;
    description: string;
    features: string[];
    featured: boolean;
  }>;
}

const PACKAGE_IDS = ["pierwsza-misja", "pelne-natarcie", "wydarzenie"] as const;
const MONEY = /\d[\d\s.,]*\s*(?:zł|zl|pln)|(?:zł|zl|pln)\s*\d/i;

export function fallbackSiteCopy(): SiteCopy {
  return {
    seo: {
      home: {
        title: "Paintball Strefa 29 | Pole paintballowe koło Gdańska",
        description: siteConfig.description,
      },
      faq: {
        title: "Najczęstsze pytania",
        description:
          "Odpowiedzi na najczęstsze pytania o Paintball Strefa 29: zapytania o termin, liczba graczy, czas wizyty, ubiór, pogoda, osoby niepełnoletnie, zaplecze i płatność.",
      },
      oferta: {
        title: "Oferta i pole paintballowe",
        description:
          "Poznaj teren Paintball Strefa 29 w Czaplach: okopy, bunkry, ambony, naturalne osłony, scenariusz z rakietą V2 oraz przebieg bezpiecznie prowadzonej wizyty.",
      },
      cennik: {
        title: "Cennik i pakiety",
        description:
          "Warianty gry na polu Paintball Strefa 29. Cenę potwierdza obsługa, a strona nie przyjmuje płatności ani nie tworzy rezerwacji.",
      },
    },
    faq: faqItems.map((item) => ({ question: item.question, answer: item.answer })),
    attractions: attractions.map((item) => ({ title: item.title, description: item.description })),
    packages: packages.map((item) => ({
      id: item.id,
      name: item.name,
      eyebrow: item.eyebrow,
      description: item.description,
      features: [...item.features],
      featured: Boolean(item.featured),
    })),
  };
}

function clean(value: string, max: number, label: string): string | { error: string } {
  const result = plainText(value, max, label);
  if (typeof result !== "string") return result;
  if (MONEY.test(result)) {
    return { error: `${label} nie może zawierać kwoty. Ceny pozostają niezatwierdzone.` };
  }
  return result;
}

function field(value: unknown, max: number, label: string): string | { error: string } {
  if (typeof value !== "string") return { error: `${label} ma nieprawidłowy format.` };
  return clean(value, max, label);
}

export function normalizeSiteCopy(input: unknown): { ok: true; value: SiteCopy } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Brak treści do zapisania." };
  const source = input as SiteCopy;
  const seoPages = ["home", "faq", "oferta", "cennik"] as const;
  const seo = {} as SiteCopy["seo"];
  for (const page of seoPages) {
    const title = field(source.seo?.[page]?.title, 90, `Tytuł SEO (${page})`);
    const description = field(source.seo?.[page]?.description, 220, `Opis SEO (${page})`);
    if (typeof title !== "string") return { ok: false, error: title.error };
    if (typeof description !== "string") return { ok: false, error: description.error };
    if (!title || !description) return { ok: false, error: `Uzupełnij tytuł i opis SEO dla strony ${page}.` };
    seo[page] = { title, description };
  }

  if (!Array.isArray(source.faq) || source.faq.length < 1 || source.faq.length > 12) {
    return { ok: false, error: "FAQ musi mieć od 1 do 12 pytań." };
  }
  const faq = [];
  for (const item of source.faq) {
    const question = field(item?.question, 180, "Pytanie");
    const answer = field(item?.answer, 800, "Odpowiedź");
    if (typeof question !== "string") return { ok: false, error: question.error };
    if (typeof answer !== "string") return { ok: false, error: answer.error };
    if (!question || !answer) return { ok: false, error: "Każde pytanie i odpowiedź są wymagane." };
    faq.push({ question, answer });
  }

  if (!Array.isArray(source.attractions) || source.attractions.length !== attractions.length) {
    return { ok: false, error: "Liczba opisów atrakcji jest stała w tym etapie." };
  }
  const nextAttractions = [];
  for (const item of source.attractions) {
    const title = field(item?.title, 80, "Nazwa atrakcji");
    const description = field(item?.description, 400, "Opis atrakcji");
    if (typeof title !== "string") return { ok: false, error: title.error };
    if (typeof description !== "string") return { ok: false, error: description.error };
    if (!title || !description) return { ok: false, error: "Nazwa i opis atrakcji są wymagane." };
    nextAttractions.push({ title, description });
  }

  if (!Array.isArray(source.packages) || source.packages.length !== PACKAGE_IDS.length) {
    return { ok: false, error: "Lista pakietów jest stała w tym etapie." };
  }
  const nextPackages = [];
  for (let index = 0; index < PACKAGE_IDS.length; index += 1) {
    const item = source.packages[index];
    if (item?.id !== PACKAGE_IDS[index]) {
      return { ok: false, error: "Identyfikatorów pakietów nie można zmieniać." };
    }
    const name = field(item.name, 80, "Nazwa pakietu");
    const eyebrow = field(item.eyebrow, 40, "Etykieta pakietu");
    const description = field(item.description, 400, "Opis pakietu");
    if (typeof name !== "string") return { ok: false, error: name.error };
    if (typeof eyebrow !== "string") return { ok: false, error: eyebrow.error };
    if (typeof description !== "string") return { ok: false, error: description.error };
    if (!Array.isArray(item.features) || item.features.length < 1 || item.features.length > 8) {
      return { ok: false, error: "Każdy pakiet ma od 1 do 8 punktów." };
    }
    const features = [];
    for (const feature of item.features) {
      const cleaned = field(feature, 120, "Punkt pakietu");
      if (typeof cleaned !== "string") return { ok: false, error: cleaned.error };
      if (!cleaned) return { ok: false, error: "Punkt pakietu nie może być pusty." };
      features.push(cleaned);
    }
    nextPackages.push({
      id: PACKAGE_IDS[index],
      name,
      eyebrow,
      description,
      features,
      featured: item.featured === true,
    });
  }

  return { ok: true, value: { seo, faq, attractions: nextAttractions, packages: nextPackages } };
}

export function selectPublishedCopy(published: SiteCopy | null, fallback: SiteCopy) {
  return published ?? fallback;
}

export function packagesForDisplay(copy: SiteCopy): OfferPackage[] {
  return copy.packages.map((item) => {
    const locked = packages.find((entry) => entry.id === item.id);
    return {
      id: item.id,
      name: item.name,
      eyebrow: item.eyebrow,
      description: item.description,
      features: item.features,
      featured: item.featured,
      price: locked?.price ?? "Wycena po zapytaniu",
    };
  });
}

export function attractionsForDisplay(copy: SiteCopy) {
  return copy.attractions.map((item, index) => ({
    icon: attractions[index]?.icon ?? "target",
    title: item.title,
    description: item.description,
  }));
}
