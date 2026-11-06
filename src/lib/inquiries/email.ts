import {
  PRIVACY_NOTICE_VERSION,
  eventTypeOptions,
  optionLabel,
  preferredContactOptions,
  preferredTimeOptions,
  type ValidInquiry,
} from "@/lib/inquiry";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export interface EmailConfig {
  apiKey: string;
  to: string;
  from: string;
}

function hasHeaderInjection(value: string): boolean {
  return value.includes("\r") || value.includes("\n");
}

export function getRateLimitSalt(): string | null {
  const salt = process.env.RATE_LIMIT_SALT?.trim() ?? "";
  return salt.length >= 16 ? salt : null;
}

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const to = process.env.INQUIRY_TO_EMAIL?.trim() ?? "";
  const from = process.env.INQUIRY_FROM_EMAIL?.trim() ?? "";

  if (
    apiKey.length < 10 ||
    !to ||
    !from ||
    hasHeaderInjection(to) ||
    hasHeaderInjection(from)
  ) {
    return null;
  }

  return { apiKey, to, from };
}

function deliveryTimeoutMs(): number {
  const parsed = Number(process.env.INQUIRY_DELIVERY_TIMEOUT_MS ?? "10000");
  if (!Number.isFinite(parsed) || parsed < 10) {
    return 10_000;
  }
  return parsed;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function displayValue(value: string): string {
  return value || "—";
}

export function buildInquiryEmail(inquiry: ValidInquiry) {
  const preferredTime = optionLabel(preferredTimeOptions, inquiry.preferredTime);
  const eventType = optionLabel(eventTypeOptions, inquiry.eventType);
  const preferredContact = optionLabel(
    preferredContactOptions,
    inquiry.preferredContact,
  );
  const rows: Array<[string, string]> = [
    ["Liczba graczy", String(inquiry.playerCount)],
    ["Preferowana data", inquiry.preferredDate],
    ["Preferowana pora", preferredTime],
    ["Termin alternatywny", displayValue(inquiry.alternateDate)],
    ["Identyfikator pakietu", inquiry.packageId],
    ["Rodzaj wydarzenia", eventType],
    ["Imię organizatora", inquiry.name],
    ["Preferowany kontakt", preferredContact],
    ["Telefon", displayValue(inquiry.phone)],
    ["E-mail", displayValue(inquiry.email)],
    ["Wiadomość", displayValue(inquiry.message)],
    ["Wersja informacji o prywatności", PRIVACY_NOTICE_VERSION],
  ];

  const text = [
    "Nowe niewiążące zapytanie o termin.",
    "",
    ...rows.map(([label, value]) => label + ": " + value),
    "",
    "To zapytanie nie sprawdza dostępności i nie tworzy rezerwacji.",
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        "<tr><th align=\"left\" valign=\"top\" style=\"padding:6px 12px 6px 0\">" +
        escapeHtml(label) +
        "</th><td style=\"padding:6px 0;white-space:pre-wrap\">" +
        escapeHtml(value) +
        "</td></tr>",
    )
    .join("");
  const html =
    "<h1>Nowe niewiążące zapytanie o termin</h1>" +
    "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\">" +
    htmlRows +
    "</table>" +
    "<p><strong>To zapytanie nie sprawdza dostępności i nie tworzy rezerwacji.</strong></p>";

  return {
    subject: "Nowe zapytanie o termin — " + inquiry.preferredDate,
    text,
    html,
  };
}

export async function sendInquiryEmail(
  inquiry: ValidInquiry,
  config: EmailConfig,
): Promise<"sent" | "failed"> {
  const email = buildInquiryEmail(inquiry);
  const payload: Record<string, unknown> = {
    from: config.from,
    to: [config.to],
    subject: email.subject,
    text: email.text,
    html: email.html,
  };

  if (inquiry.email) {
    payload.reply_to = inquiry.email;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), deliveryTimeoutMs());

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
