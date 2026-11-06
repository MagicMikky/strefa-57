export interface CommercialSnapshot {
  depositAmount?: string | null;
  privateSlotSurcharge?: string | null;
  paymentProvider?: string | null;
  cancellationPolicy?: string | null;
  commercialApproved?: boolean;
}

export interface CheckoutBlocker {
  id: string;
  label: string;
}

const FIXED_BLOCKERS: readonly CheckoutBlocker[] = [
  { id: "D-05", label: "Ceny pakietów nie są zatwierdzone." },
  { id: "D-12", label: "Zasady zwrotów nie są zatwierdzone." },
  { id: "D-17", label: "Okno rezerwacji nie jest zatwierdzone." },
  { id: "D-18", label: "Czas blokady terminu nie jest zatwierdzony." },
  { id: "D-25", label: "Regulamin i polityka prywatności sprzedaży nie są zatwierdzone." },
];

export function checkoutReadiness(settings: CommercialSnapshot = {}): { enabled: false; missing: CheckoutBlocker[] } {
  const missing = [...FIXED_BLOCKERS];
  if (!present(settings.depositAmount)) missing.push({ id: "D-07", label: "Kwota zadatku nie jest zatwierdzona." });
  if (!present(settings.privateSlotSurcharge)) missing.push({ id: "D-09", label: "Dopłata za slot prywatny nie jest zatwierdzona." });
  if (!present(settings.paymentProvider)) missing.push({ id: "D-10", label: "Operator płatności nie jest wybrany." });
  if (!present(settings.cancellationPolicy)) missing.push({ id: "D-11", label: "Zasady anulowania nie są zatwierdzone." });
  if (settings.commercialApproved) {
    missing.push({ id: "commercial-approved", label: "Flaga zatwierdzenia nie włącza sprzedaży, gdy brakuje zasad." });
  }
  return { enabled: false, missing };
}

function present(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
