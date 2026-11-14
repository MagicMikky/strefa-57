import { siteConfig } from "@/data/site";

export const BUSINESS_SLOT = {
  draft: "draft",
  published: "published",
} as const;

export type BusinessSlot = (typeof BUSINESS_SLOT)[keyof typeof BUSINESS_SLOT];

export interface BusinessProfileInput {
  tradeName: string;
  legalName: string;
  taxId: string;
  street: string;
  registeredStreet: string;
  registeredPostalCode: string;
  registeredCity: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  dataController: string;
  description: string;
  latitude: string;
  longitude: string;
  mapNote: string;
}

export interface BusinessContactInput {
  phoneDisplay: string;
  emailDisplay: string;
  hours: string;
  socialText: string;
  directions: string;
}

export interface BusinessSettingsInput {
  minPlayersPerBooking: number;
  maxPlayersPerTeam: number;
  minTeamsPerMatch: number;
  maxTeamsPerMatch: number;
  maxPlayersPerSlot: number;
  slotStartTimes: string[];
  slotDurationMinutes: number;
  slotBufferMinutes: number;
  allowSharedSlot: boolean;
  allowPrivateSlot: boolean;
  depositAmount: string;
  campfirePrice: string;
  grillPrice: string;
}

export interface BusinessBundle {
  profile: BusinessProfileInput;
  contact: BusinessContactInput & { phoneHref: string; emailHref: string };
  settings: BusinessSettingsInput;
}

export const initialBusinessSettings: BusinessSettingsInput = {
  minPlayersPerBooking: 8,
  maxPlayersPerTeam: 8,
  minTeamsPerMatch: 2,
  maxTeamsPerMatch: 8,
  maxPlayersPerSlot: 50,
  slotStartTimes: ["10:00", "12:00", "15:00", "18:00"],
  slotDurationMinutes: 120,
  slotBufferMinutes: 0,
  allowSharedSlot: true,
  allowPrivateSlot: true,
  depositAmount: "500.00",
  campfirePrice: "200.00",
  grillPrice: "200.00",
};

export function fallbackBusiness(): BusinessBundle {
  return {
    profile: {
      tradeName: siteConfig.name,
      legalName: "",
      taxId: "",
      street: siteConfig.address.street,
      registeredStreet: "",
      registeredPostalCode: "",
      registeredCity: "",
      postalCode: siteConfig.address.postalCode,
      city: siteConfig.address.city,
      region: siteConfig.address.region,
      country: siteConfig.address.country,
      dataController: "",
      description: siteConfig.description,
      latitude: "",
      longitude: "",
      mapNote: siteConfig.address.directionsNote,
    },
    contact: {
      phoneDisplay: siteConfig.contact.phoneDisplay,
      phoneHref: siteConfig.contact.phoneHref,
      emailDisplay: siteConfig.contact.emailDisplay,
      emailHref: siteConfig.contact.emailHref,
      hours: siteConfig.contact.hours,
      socialText: "",
      directions: siteConfig.address.directionsNote,
    },
    settings: initialBusinessSettings,
  };
}

export function formatBusinessAddress(profile: Pick<BusinessProfileInput, "street" | "postalCode" | "city">) {
  return `${profile.street}, ${profile.postalCode} ${profile.city}`;
}

const TAG = /[<>]/;
const SCRIPT = /javascript\s*:/i;

export function plainText(value: string, max: number, label: string): string | { error: string } {
  const trimmed = value.replace(/\r\n/g, "\n").trim();
  if (trimmed.length > max) {
    return { error: `${label} może mieć najwyżej ${max} znaków.` };
  }
  if (TAG.test(trimmed) || SCRIPT.test(trimmed)) {
    return { error: `${label} nie może zawierać znaczników HTML ani skryptów.` };
  }
  return trimmed;
}

function phoneHref(display: string): string | { error: string } {
  const compact = display.replace(/[^\d+]/g, "");
  if (!/^\+?\d{7,15}$/.test(compact)) {
    return { error: "Podaj numer telefonu składający się z 7–15 cyfr." };
  }
  return `tel:${compact}`;
}

function emailHref(display: string): string | { error: string } {
  const value = display.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 160) {
    return { error: "Podaj prawidłowy adres e-mail." };
  }
  return `mailto:${value}`;
}

function coordinate(value: string, min: number, max: number, label: string): string | { error: string } {
  if (!value.trim()) return "";
  if (!/^-?\d{1,3}(\.\d{1,7})?$/.test(value.trim())) {
    return { error: `${label} podaj jako liczbę dziesiętną.` };
  }
  const number = Number(value);
  if (number < min || number > max) {
    return { error: `${label} jest poza dopuszczalnym zakresem.` };
  }
  return value.trim();
}

function integer(value: number, min: number, max: number, label: string): string | null {
  if (!Number.isInteger(value) || value < min || value > max) {
    return `${label} musi być liczbą całkowitą od ${min} do ${max}.`;
  }
  return null;
}

export function normalizeBusiness(input: {
  profile: BusinessProfileInput;
  contact: BusinessContactInput;
  settings: BusinessSettingsInput;
}): { ok: true; value: BusinessBundle } | { ok: false; error: string } {
  const fields: Array<[string, number, string]> = [
    [input.profile.tradeName, 80, "Nazwa handlowa"],
    [input.profile.legalName, 160, "Nazwa prawna"],
    [input.profile.taxId, 10, "NIP"],
    [input.profile.street, 120, "Ulica"],
    [input.profile.registeredStreet, 120, "Ulica rejestrowa"],
    [input.profile.registeredPostalCode, 12, "Kod rejestrowy"],
    [input.profile.registeredCity, 80, "Miejscowość rejestrowa"],
    [input.profile.postalCode, 12, "Kod pocztowy"],
    [input.profile.city, 80, "Miejscowość"],
    [input.profile.region, 80, "Województwo"],
    [input.profile.country, 2, "Kraj"],
    [input.profile.dataController, 200, "Administrator danych"],
    [input.profile.description, 500, "Opis"],
    [input.profile.mapNote, 300, "Wskazówka dojazdu"],
    [input.contact.phoneDisplay, 40, "Telefon"],
    [input.contact.emailDisplay, 160, "E-mail"],
    [input.contact.hours, 160, "Godziny kontaktu"],
    [input.contact.socialText, 500, "Linki społecznościowe"],
    [input.contact.directions, 500, "Dojazd"],
  ];
  const cleaned: Record<string, string> = {};
  for (const [value, max, label] of fields) {
    const result = plainText(value, max, label);
    if (typeof result !== "string") return { ok: false, error: result.error };
    cleaned[label] = result;
  }

  if (!cleaned["Nazwa handlowa"] || !cleaned.Ulica || !cleaned["Kod pocztowy"] || !cleaned.Miejscowość) {
    return { ok: false, error: "Nazwa handlowa i adres są wymagane." };
  }
  if (cleaned.NIP && !/^\d{10}$/.test(cleaned.NIP)) {
    return { ok: false, error: "NIP musi mieć 10 cyfr albo pozostać pusty." };
  }
  if (cleaned.Kraj && !/^[A-Z]{2}$/.test(cleaned.Kraj)) {
    return { ok: false, error: "Kraj podaj jako dwuliterowy kod, na przykład PL." };
  }

  const latitude = coordinate(input.profile.latitude, -90, 90, "Szerokość geograficzna");
  const longitude = coordinate(input.profile.longitude, -180, 180, "Długość geograficzna");
  if (typeof latitude !== "string") return { ok: false, error: latitude.error };
  if (typeof longitude !== "string") return { ok: false, error: longitude.error };
  if (Boolean(latitude) !== Boolean(longitude)) {
    return { ok: false, error: "Współrzędne podaj obie albo żadnej." };
  }

  let phoneLink = "";
  if (cleaned.Telefon && !/potwierdzenia/i.test(cleaned.Telefon)) {
    const href = phoneHref(cleaned.Telefon);
    if (typeof href !== "string") return { ok: false, error: href.error };
    phoneLink = href;
  }
  let emailLink = "";
  if (cleaned["E-mail"] && !/potwierdzenia/i.test(cleaned["E-mail"])) {
    const href = emailHref(cleaned["E-mail"]);
    if (typeof href !== "string") return { ok: false, error: href.error };
    emailLink = href;
  }

  for (const line of cleaned["Linki społecznościowe"].split("\n").map((item) => item.trim()).filter(Boolean)) {
    if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(line)) {
      return { ok: false, error: "Każdy link społecznościowy musi zaczynać się od https://." };
    }
  }

  const settings = input.settings;
  const problems = [
    integer(settings.minPlayersPerBooking, 1, 256, "Minimalna liczba graczy w rezerwacji"),
    integer(settings.maxPlayersPerTeam, 1, 64, "Limit zawodników w drużynie"),
    integer(settings.minTeamsPerMatch, 1, 8, "Minimalna liczba drużyn"),
    integer(settings.maxTeamsPerMatch, 1, 8, "Maksymalna liczba drużyn"),
    integer(settings.maxPlayersPerSlot, 1, 256, "Limit graczy w slocie"),
    integer(settings.slotDurationMinutes, 30, 360, "Czas gry"),
    integer(settings.slotBufferMinutes, 0, 240, "Przerwa między slotami"),
  ].filter(Boolean);
  if (problems.length > 0) return { ok: false, error: problems[0] as string };
  if (settings.minTeamsPerMatch > settings.maxTeamsPerMatch) {
    return { ok: false, error: "Minimalna liczba drużyn nie może być większa od maksymalnej." };
  }
  if (settings.maxPlayersPerSlot < settings.maxPlayersPerTeam) {
    return { ok: false, error: "Slot musi pomieścić przynajmniej jedną pełną drużynę." };
  }
  if (settings.minPlayersPerBooking > settings.maxPlayersPerSlot) {
    return { ok: false, error: "Minimalna grupa nie może przekraczać pojemności slotu." };
  }
  if (settings.maxPlayersPerSlot > settings.maxPlayersPerTeam * settings.maxTeamsPerMatch) {
    return { ok: false, error: "Limit graczy w slocie nie może przekraczać iloczynu limitu drużyny i liczby drużyn." };
  }
  const times = settings.slotStartTimes.map((item) => item.trim());
  if (times.length < 1 || times.length > 6 || new Set(times).size !== times.length) {
    return { ok: false, error: "Podaj od 1 do 6 różnych godzin startu." };
  }
  if (times.some((item) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(item))) {
    return { ok: false, error: "Godziny startu podaj w formacie GG:MM." };
  }
  for (const [value, label] of [[settings.depositAmount, "Zadatek"], [settings.campfirePrice, "Ognisko"], [settings.grillPrice, "Grill"]]) {
    if (!/^\d{1,6}\.\d{2}$/.test(value)) return { ok: false, error: `${label} podaj w PLN z dwoma miejscami po przecinku, np. 200.00.` };
  }

  return {
    ok: true,
    value: {
      profile: {
        tradeName: cleaned["Nazwa handlowa"],
        legalName: cleaned["Nazwa prawna"],
        taxId: cleaned.NIP,
        street: cleaned.Ulica,
        registeredStreet: cleaned["Ulica rejestrowa"],
        registeredPostalCode: cleaned["Kod rejestrowy"],
        registeredCity: cleaned["Miejscowość rejestrowa"],
        postalCode: cleaned["Kod pocztowy"],
        city: cleaned.Miejscowość,
        region: cleaned.Województwo,
        country: cleaned.Kraj || "PL",
        dataController: cleaned["Administrator danych"],
        description: cleaned.Opis,
        latitude,
        longitude,
        mapNote: cleaned["Wskazówka dojazdu"],
      },
      contact: {
        phoneDisplay: cleaned.Telefon,
        phoneHref: phoneLink,
        emailDisplay: cleaned["E-mail"],
        emailHref: emailLink,
        hours: cleaned["Godziny kontaktu"],
        socialText: cleaned["Linki społecznościowe"],
        directions: cleaned.Dojazd,
      },
      settings: { ...settings, slotStartTimes: times },
    },
  };
}

export function selectPublicBundle(published: BusinessBundle | null, fallback: BusinessBundle) {
  return published ?? fallback;
}
