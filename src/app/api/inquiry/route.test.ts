import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";
import { getWarsawDate } from "@/lib/inquiry";
import { getInquiryRepository, resetInquiryRepositoryForTests } from "@/lib/inquiries/repository";
import { resetRateLimitForTests } from "@/lib/rate-limit";

const mutableEnv = [
  "RESEND_API_KEY",
  "INQUIRY_TO_EMAIL",
  "INQUIRY_FROM_EMAIL",
  "RATE_LIMIT_SALT",
  "RATE_LIMIT_MAX_REQUESTS",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_SITE_URL",
  "INQUIRY_STORE",
  "DATABASE_URL",
] as const;

const originalEnv = Object.fromEntries(
  mutableEnv.map((key) => [key, process.env[key]]),
);

function restoreEnv(): void {
  for (const key of mutableEnv) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function configureForm(): void {
  // These legacy values must never cause an external e-mail request.
  process.env.RESEND_API_KEY = "re_test_key_value";
  process.env.INQUIRY_TO_EMAIL = "inbox@example.com";
  process.env.INQUIRY_FROM_EMAIL = "Strefa 29 <form@example.com>";
  process.env.RATE_LIMIT_SALT = "0123456789abcdef";
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  process.env.INQUIRY_STORE = "memory";
  delete process.env.DATABASE_URL;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

function validBody(overrides: Record<string, unknown> = {}) {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 2);
  return {
    playerCount: 8,
    preferredDate: getWarsawDate(tomorrow),
    preferredTime: "12:00",
    alternateDate: "",
    packageId: "pierwsza-misja",
    eventType: "znajomi",
    name: "Anna",
    preferredContact: "email",
    phone: "",
    email: "anna@example.com",
    message: "Proszę o kontakt <b>",
    privacyAccepted: true,
    website: "",
    ...overrides,
  };
}

function inquiryRequest(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost:3000/api/inquiry", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      ...headers,
    },
    body: payload,
  });
}

describe("POST /api/inquiry", () => {
  beforeEach(() => {
    restoreEnv();
    configureForm();
    resetRateLimitForTests();
    resetInquiryRepositoryForTests();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    restoreEnv();
    vi.unstubAllGlobals();
  });

  it("returns 503 when the rate-limit salt is missing", async () => {
    delete process.env.RATE_LIMIT_SALT;
    const response = await POST(inquiryRequest(validBody()));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("saves an inquiry in the database without creating an e-mail job", async () => {
    delete process.env.RESEND_API_KEY;
    const response = await POST(inquiryRequest(validBody()));
    expect(response.status).toBe(200);
    const stored = await getInquiryRepository()?.list({
      q: "",
      status: "",
      sort: "createdAt",
      direction: "desc",
      page: 1,
      pageSize: 20,
    });
    expect(stored?.total).toBe(1);
    expect(stored?.items[0]?.notifications).toEqual([]);
  });

  it("returns 403 for a cross-site request", async () => {
    const response = await POST(
      inquiryRequest(validBody(), {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      }),
    );
    expect(response.status).toBe(403);
  });

  it("returns 415 for a non-JSON body", async () => {
    const response = await POST(
      inquiryRequest("name=Anna", { "content-type": "text/plain" }),
    );
    expect(response.status).toBe(415);
  });

  it("returns 413 when the declared body is too large", async () => {
    const response = await POST(
      inquiryRequest(validBody(), { "content-length": "20000" }),
    );
    expect(response.status).toBe(413);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(inquiryRequest("{"));
    expect(response.status).toBe(400);
  });

  it("returns 422 for an invalid inquiry and does not include the address in the response", async () => {
    const response = await POST(
      inquiryRequest(validBody({ email: "not-an-email", playerCount: 0 })),
    );
    expect(response.status).toBe(422);
    const payload = (await response.json()) as { ok: boolean; fieldErrors?: { email?: string } };
    expect(payload.ok).toBe(false);
    expect(payload.fieldErrors?.email).toBeDefined();
    expect(JSON.stringify(payload)).not.toContain("anna@example.com");
  });

  it("accepts a honeypot submission without calling the email provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(inquiryRequest(validBody({ website: "https://spam.example" })));
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never calls an external e-mail provider", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(inquiryRequest(validBody()));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-ratelimit-limit")).toBe("5");
    expect(response.headers.get("x-ratelimit-store")).toBe("memory");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not create a second inquiry for the same payload", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const headers = { "idempotency-key": "same-submission-key-123" };
    expect((await POST(inquiryRequest(validBody(), headers))).status).toBe(200);
    expect((await POST(inquiryRequest(validBody(), headers))).status).toBe(200);
    const stored = await getInquiryRepository()?.counts();
    expect(stored?.fresh).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the inquiry store is unavailable and does not echo the address", async () => {
    process.env.INQUIRY_STORE = "fail";
    const response = await POST(inquiryRequest(validBody()));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("anna@example.com");
  });

  it("returns 429 after the configured number of requests", async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = "2";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const headers = { "x-vercel-forwarded-for": "203.0.113.10" };

    expect((await POST(inquiryRequest(validBody(), headers))).status).toBe(200);
    expect((await POST(inquiryRequest(validBody(), headers))).status).toBe(200);
    const limited = await POST(inquiryRequest(validBody(), headers));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });

  it("allows two distinct submissions under the limit", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(inquiryRequest(validBody()))).status).toBe(200);
    expect((await POST(inquiryRequest(validBody({ message: "Druga, inna prośba" })))).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the shared rate limit store is unavailable", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "0123456789abcdef";
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));
    const response = await POST(inquiryRequest(validBody()));
    expect(response.status).toBe(503);
  });
});
