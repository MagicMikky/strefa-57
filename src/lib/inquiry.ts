import { packages } from "@/data/site";

// Technical bounds until the owner approves a business minimum and maximum.
export const MIN_PLAYER_COUNT = 1;
export const MAX_PLAYER_COUNT = 200;
export const UNKNOWN_PACKAGE_ID = "nie-wiem";
export const MAX_MESSAGE_LENGTH = 2_000;
export const PRIVACY_NOTICE_VERSION = "1.0";

export const INQUIRY_SUCCESS_MESSAGE =
  "Zapytanie zostało wysłane. Termin nie jest jeszcze zarezerwowany ani zablokowany. Obsługa skontaktuje się z Tobą, aby potwierdzić dostępność, cenę i dalsze kroki.";

export const preferredTimeOptions = [
  { value: "", label: "Bez preferencji" },
  { value: "09:00", label: "Około 09:00" },
  { value: "12:00", label: "Około 12:00" },
  { value: "15:00", label: "Około 15:00" },
  { value: "18:00", label: "Około 18:00" },
  { value: "dowolna", label: "Dowolna pora" },
] as const;

export const eventTypeOptions = [
  { value: "znajomi", label: "Gra ze znajomymi" },
  { value: "urodziny", label: "Urodziny" },
  { value: "kawalerskie-panienskie", label: "Wieczór kawalerski lub panieński" },
  { value: "firma", label: "Integracja firmowa" },
  { value: "szkola", label: "Szkoła lub grupa zorganizowana" },
  { value: "inne", label: "Inne" },
] as const;

export const preferredContactOptions = [
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefon" },
] as const;

export type PreferredTime = (typeof preferredTimeOptions)[number]["value"];
export type EventType = (typeof eventTypeOptions)[number]["value"];
export type PreferredContact =
  (typeof preferredContactOptions)[number]["value"];

export interface InquiryPayload {
  playerCount: number;
  preferredDate: string;
  preferredTime: string;
  alternateDate: string;
  packageId: string;
  eventType: string;
  name: string;
  preferredContact: string;
  phone: string;
  email: string;
  message: string;
  privacyAccepted: boolean;
  website: string;
}

export interface ValidInquiry extends InquiryPayload {
  preferredTime: PreferredTime;
  eventType: EventType;
  preferredContact: PreferredContact;
}

export type InquiryField = keyof InquiryPayload;
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>;

export type InquiryValidationResult =
  | { ok: true; data: ValidInquiry }
  | {
      ok: false;
      message: string;
      fieldErrors: InquiryFieldErrors;
    };

export type InquiryApiResponse =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: InquiryFieldErrors;
    };

const packageIdPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const allowedPackageIds = new Set<string>([
  UNKNOWN_PACKAGE_ID,
  ...packages.map((item) => item.id),
]);
const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPhoneCharactersPattern = /^\+?[0-9 ()-]+$/;
const forbiddenControlCharacters =
  /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

const preferredTimes = new Set<string>(
  preferredTimeOptions.map((option) => option.value),
);
const eventTypes = new Set<string>(
  eventTypeOptions.map((option) => option.value),
);
const preferredContacts = new Set<string>(
  preferredContactOptions.map((option) => option.value),
);

function readString(
  source: Record<string, unknown>,
  field: InquiryField,
  errors: InquiryFieldErrors,
): string {
  const value = source[field];

  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    errors[field] = "To pole ma nieprawidłowy format.";
    return "";
  }

  return value.trim();
}

function isValidDateOnly(value: string): boolean {
  const match = dateOnlyPattern.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getWarsawDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return part("year") + "-" + part("month") + "-" + part("day");
}

function normalizeMessage(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

function hasForbiddenControlCharacters(value: string): boolean {
  return forbiddenControlCharacters.test(value);
}

function isValidPhone(value: string): boolean {
  if (
    value.length > 30 ||
    !allowedPhoneCharactersPattern.test(value) ||
    hasForbiddenControlCharacters(value)
  ) {
    return false;
  }

  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function isValidEmail(value: string): boolean {
  return (
    value.length <= 254 &&
    emailPattern.test(value) &&
    !hasForbiddenControlCharacters(value)
  );
}

export function validateInquiry(
  input: unknown,
  now = new Date(),
): InquiryValidationResult {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input)
  ) {
    return {
      ok: false,
      message: "Nie udało się odczytać danych formularza.",
      fieldErrors: {},
    };
  }

  const source = input as Record<string, unknown>;
  const fieldErrors: InquiryFieldErrors = {};

  const playerCount =
    typeof source.playerCount === "number" ? source.playerCount : Number.NaN;
  if (
    !Number.isInteger(playerCount) ||
    playerCount < MIN_PLAYER_COUNT ||
    playerCount > MAX_PLAYER_COUNT
  ) {
    fieldErrors.playerCount =
      "Podaj liczbę całkowitą od " +
      MIN_PLAYER_COUNT +
      " do " +
      MAX_PLAYER_COUNT +
      ".";
  }

  const preferredDate = readString(source, "preferredDate", fieldErrors);
  const preferredTime = readString(source, "preferredTime", fieldErrors);
  const alternateDate = readString(source, "alternateDate", fieldErrors);
  const packageId = readString(source, "packageId", fieldErrors).toLowerCase();
  const eventType = readString(source, "eventType", fieldErrors);
  const name = readString(source, "name", fieldErrors);
  const preferredContact = readString(
    source,
    "preferredContact",
    fieldErrors,
  );
  const phone = readString(source, "phone", fieldErrors);
  const email = readString(source, "email", fieldErrors).toLowerCase();
  const message = normalizeMessage(readString(source, "message", fieldErrors));
  const website = readString(source, "website", fieldErrors);
  const today = getWarsawDate(now);

  if (!preferredDate) {
    fieldErrors.preferredDate = "Wybierz preferowaną datę.";
  } else if (!isValidDateOnly(preferredDate)) {
    fieldErrors.preferredDate = "Podaj prawidłową datę.";
  } else if (preferredDate < today) {
    fieldErrors.preferredDate = "Preferowana data nie może być datą z przeszłości.";
  }

  if (!preferredTimes.has(preferredTime)) {
    fieldErrors.preferredTime = "Wybierz jedną z dostępnych pór.";
  }

  if (alternateDate) {
    if (!isValidDateOnly(alternateDate)) {
      fieldErrors.alternateDate = "Podaj prawidłową datę alternatywną.";
    } else if (alternateDate < today) {
      fieldErrors.alternateDate =
        "Termin alternatywny nie może być datą z przeszłości.";
    }
  }

  if (!packageId) {
    fieldErrors.packageId = "Wybierz pakiet albo opcję „Nie wiem”.";
  } else if (!packageIdPattern.test(packageId) || !allowedPackageIds.has(packageId)) {
    fieldErrors.packageId = "Wybierz jeden z dostępnych pakietów.";
  }

  if (!eventTypes.has(eventType)) {
    fieldErrors.eventType = "Wybierz rodzaj wydarzenia.";
  }

  if (name.length < 2 || name.length > 100) {
    fieldErrors.name = "Podaj imię organizatora (od 2 do 100 znaków).";
  } else if (hasForbiddenControlCharacters(name)) {
    fieldErrors.name = "Imię zawiera niedozwolone znaki.";
  }

  if (!preferredContacts.has(preferredContact)) {
    fieldErrors.preferredContact = "Wybierz preferowany sposób kontaktu.";
  }

  if (phone && !isValidPhone(phone)) {
    fieldErrors.phone = "Podaj prawidłowy numer telefonu.";
  } else if (preferredContact === "phone" && !phone) {
    fieldErrors.phone = "Numer telefonu jest wymagany dla kontaktu telefonicznego.";
  }

  if (email && !isValidEmail(email)) {
    fieldErrors.email = "Podaj prawidłowy adres e-mail.";
  } else if (preferredContact === "email" && !email) {
    fieldErrors.email = "Adres e-mail jest wymagany dla kontaktu e-mailowego.";
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    fieldErrors.message =
      "Wiadomość może mieć maksymalnie " +
      MAX_MESSAGE_LENGTH +
      " znaków.";
  } else if (hasForbiddenControlCharacters(message)) {
    fieldErrors.message = "Wiadomość zawiera niedozwolone znaki.";
  }

  if (source.privacyAccepted !== true) {
    fieldErrors.privacyAccepted =
      "Potwierdź zapoznanie się z polityką prywatności.";
  }

  if (website.length > 200) {
    fieldErrors.website = "To pole ma nieprawidłową wartość.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Popraw zaznaczone pola i spróbuj ponownie.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      playerCount,
      preferredDate,
      preferredTime: preferredTime as PreferredTime,
      alternateDate,
      packageId,
      eventType: eventType as EventType,
      name,
      preferredContact: preferredContact as PreferredContact,
      phone,
      email,
      message,
      privacyAccepted: true,
      website,
    },
  };
}

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
