import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";

import {
  INQUIRY_SUCCESS_MESSAGE,
  type InquiryApiResponse,
  validateInquiry,
} from "@/lib/inquiry";
import { readPublicBusiness } from "@/lib/business/public";
import { readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";
import { dispatchInquiryNotification } from "@/lib/inquiries/dispatch";
import { getRateLimitSalt } from "@/lib/inquiries/email";
import {
  InquiryConflictError,
  inquiryContentHash,
  inquiryFromPayload,
  resolveDedupeKey,
} from "@/lib/inquiries/model";
import { getInquiryRepository } from "@/lib/inquiries/repository";
import { consumeInquiryRateLimit, rateLimitSettings } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_384;

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
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
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

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return jsonResponse(
      { ok: false, message: "Żądanie pochodzi z niedozwolonego źródła." },
      403,
    );
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse(
      { ok: false, message: "Formularz musi zostać wysłany w formacie JSON." },
      415,
    );
  }

  const salt = getRateLimitSalt();
  if (!salt) {
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
    rateLimit = await consumeInquiryRateLimit(hashRateLimitKey(request, salt));
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
        message: "Wysłano zbyt wiele formularzy. Odczekaj chwilę i spróbuj ponownie.",
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
      { ok: false, message: "Nie udało się odczytać formularza." },
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

  const business = await readPublicBusiness(Boolean(process.env.DATABASE_URL), () => readPublished(getPrisma()));
  const validation = validateInquiry(input, new Date(), business.settings.slotStartTimes);
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

  const repository = getInquiryRepository();
  if (!repository) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Formularz jest chwilowo niedostępny. Spróbuj ponownie później lub skontaktuj się z obsługą bezpośrednio.",
      },
      503,
      rateLimitHeaders,
    );
  }

  const contentHash = inquiryContentHash(validation.data);
  const dedupe = resolveDedupeKey(
    contentHash,
    request.headers.get("idempotency-key"),
  );
  if ("error" in dedupe) {
    return jsonResponse(
      { ok: false, message: dedupe.error },
      400,
      rateLimitHeaders,
    );
  }

  try {
    const saved = await repository.createIfAbsent({
      record: inquiryFromPayload(validation.data, dedupe.dedupeKey, contentHash),
    });
    await dispatchInquiryNotification(repository, saved.record.id, validation.data);
  } catch (error) {
    if (error instanceof InquiryConflictError) {
      return jsonResponse(
        {
          ok: false,
          message: "Ten klucz zgłoszenia został już użyty dla innej treści.",
        },
        409,
        rateLimitHeaders,
      );
    }
    return jsonResponse(
      {
        ok: false,
        message:
          "Formularz jest chwilowo niedostępny. Spróbuj ponownie później lub skontaktuj się z obsługą bezpośrednio.",
      },
      503,
      rateLimitHeaders,
    );
  }

  return jsonResponse(
    { ok: true, message: INQUIRY_SUCCESS_MESSAGE },
    200,
    rateLimitHeaders,
  );
}
