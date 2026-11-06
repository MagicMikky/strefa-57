import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";

import {
  INQUIRY_SUCCESS_MESSAGE,
  PRIVACY_NOTICE_VERSION,
  eventTypeOptions,
  optionLabel,
  preferredContactOptions,
  preferredTimeOptions,
  type InquiryApiResponse,
  type ValidInquiry,
  validateInquiry,
} from "@/lib/inquiry";
import { consumeInquiryRateLimit, rateLimitSettings } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const MAX_BODY_BYTES = 16_384;

interface EmailConfig {
  apiKey: string;
  to: string;
  from: string;
  rateLimitSalt: string;
}

class BodyReadError extends Error {
  constructor(
    readonly status: number,
    readonly publicMessage: string,
  ) {
    super(publicMessage);
  }
}

function jsonResponse(
  body: InquiryApiResponse,
  status: number,
  headers?: HeadersInit,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function hasHeaderInjection(value: string): boolean {
  return value.includes("\r") || value.includes("\n");
}

function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const to = process.env.INQUIRY_TO_EMAIL?.trim() ?? "";
  const from = process.env.INQUIRY_FROM_EMAIL?.trim() ?? "";
  const rateLimitSalt = process.env.RATE_LIMIT_SALT?.trim() ?? "";

  if (
    apiKey.length < 10 ||
    !to ||
    !from ||
    rateLimitSalt.length < 16 ||
    hasHeaderInjection(to) ||
    hasHeaderInjection(from)
  ) {
    return null;
  }

  return { apiKey, to, from, rateLimitSalt };
}

function firstAddress(value: string | null): string {
  return value?.split(",")[0]?.trim().slice(0, 128) || "";
}

function getClientAddress(headers: Headers): string {
  const platformAddress =
    firstAddress(headers.get("x-vercel-forwarded-for")) ||
    firstAddress(headers.get("cf-connecting-ip"));
  if (platformAddress) {
    return platformAddress;
  }

  if (process.env.RATE_LIMIT_TRUST_PROXY === "true") {
    const proxyAddress =
      firstAddress(headers.get("x-real-ip")) ||
      firstAddress(headers.get("x-forwarded-for"));
    if (proxyAddress) {
      return proxyAddress;
    }
  }

  return "unknown";
}

function deliveryTimeoutMs(): number {
  const parsed = Number(process.env.INQUIRY_DELIVERY_TIMEOUT_MS ?? "10000");
  if (!Number.isFinite(parsed) || parsed < 10) {
    return 10_000;
  }
  return parsed;
}

function hashRateLimitKey(request: Request, salt: string): string {
  const address = getClientAddress(request.headers);
  const userAgent =
    address === "unknown"
      ? (request.headers.get("user-agent") ?? "unknown").slice(0, 256)
      : "";
  const identity = address + "|" + userAgent;

  return createHmac("sha256", salt).update(identity).digest("hex");
}

function isAllowedOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const allowedOrigins = new Set([new URL(request.url).origin]);
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (configuredSiteUrl) {
      allowedOrigins.add(new URL(configuredSiteUrl).origin);
    }

    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

async function readLimitedJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_BODY_BYTES
  ) {
    throw new BodyReadError(
      413,
      "Formularz jest zbyt duży. Skróć wiadomość i spróbuj ponownie.",
    );
  }

  if (!request.body) {
    throw new BodyReadError(400, "Formularz nie zawiera danych.");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new BodyReadError(
        413,
        "Formularz jest zbyt duży. Skróć wiadomość i spróbuj ponownie.",
      );
    }

    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  if (!body.trim()) {
    throw new BodyReadError(400, "Formularz nie zawiera danych.");
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new BodyReadError(
      400,
      "Nie udało się odczytać formularza. Odśwież stronę i spróbuj ponownie.",
    );
  }
}

function isHoneypotFilled(input: unknown): boolean {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return false;
  }

  const value = (input as Record<string, unknown>).website;
  return typeof value === "string" && value.trim().length > 0;
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

function buildEmail(inquiry: ValidInquiry) {
  const preferredTime = optionLabel(
    preferredTimeOptions,
    inquiry.preferredTime,
  );
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

async function sendInquiryEmail(
  inquiry: ValidInquiry,
  config: EmailConfig,
): Promise<boolean> {
  const email = buildEmail(inquiry);
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

    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return jsonResponse(
      {
        ok: false,
        message: "Żądanie pochodzi z niedozwolonego źródła.",
      },
      403,
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse(
      {
        ok: false,
        message: "Formularz musi zostać wysłany w formacie JSON.",
      },
      415,
    );
  }

  const config = getEmailConfig();
  if (!config) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Formularz jest chwilowo niedostępny. Spróbuj ponownie później lub skontaktuj się z obsługą bezpośrednio.",
      },
      503,
    );
  }

  let rateLimit;
  try {
    rateLimit = await consumeInquiryRateLimit(
      hashRateLimitKey(request, config.rateLimitSalt),
    );
  } catch {
    return jsonResponse(
      {
        ok: false,
        message:
          "Formularz jest chwilowo niedostępny. Spróbuj ponownie później lub skontaktuj się z obsługą bezpośrednio.",
      },
      503,
    );
  }

  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rateLimitSettings().maxRequests),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Store": rateLimit.store,
  };

  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Wysłano zbyt wiele formularzy. Odczekaj chwilę i spróbuj ponownie.",
      },
      429,
      {
        ...rateLimitHeaders,
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    );
  }

  let input: unknown;
  try {
    input = await readLimitedJson(request);
  } catch (error) {
    if (error instanceof BodyReadError) {
      return jsonResponse(
        { ok: false, message: error.publicMessage },
        error.status,
        rateLimitHeaders,
      );
    }

    return jsonResponse(
      {
        ok: false,
        message: "Nie udało się odczytać formularza.",
      },
      400,
      rateLimitHeaders,
    );
  }

  if (isHoneypotFilled(input)) {
    return jsonResponse(
      { ok: true, message: INQUIRY_SUCCESS_MESSAGE },
      200,
      rateLimitHeaders,
    );
  }

  const validation = validateInquiry(input);
  if (!validation.ok) {
    return jsonResponse(
      {
        ok: false,
        message: validation.message,
        fieldErrors: validation.fieldErrors,
      },
      422,
      rateLimitHeaders,
    );
  }

  const delivered = await sendInquiryEmail(validation.data, config);
  if (!delivered) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Nie udało się teraz wysłać zapytania. Dane pozostały w formularzu — spróbuj ponownie za kilka minut lub skontaktuj się z obsługą bezpośrednio.",
      },
      502,
      rateLimitHeaders,
    );
  }

  return jsonResponse(
    { ok: true, message: INQUIRY_SUCCESS_MESSAGE },
    200,
    rateLimitHeaders,
  );
}
