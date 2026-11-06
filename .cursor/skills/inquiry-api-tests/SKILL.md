---
name: inquiry-api-tests
description: Use when changing the inquiry form, /api/inquiry, validation, rate limiting, or the email provider adapter.
---

# Inquiry API tests

The handler lives in `src/app/api/inquiry/route.ts`. Validation lives in `src/lib/inquiry.ts`. Rate limiting lives in `src/lib/rate-limit.ts`.

Cover status codes 200, 400, 403, 413, 415, 422, 429, 502, and 503. Include a honeypot submission, a provider timeout, a duplicate submission under the limit, and HTML escaping of the operator email.

Do not put email, phone, name, or message into analytics properties. `publicAnalyticsProperties` removes those keys.

Shared limits use Upstash Redis only when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present. Otherwise the memory adapter is used and must be reported as a multi-instance blocker. Never invent those credentials.

Reset `resetRateLimitForTests()` between Vitest cases. Run `npm test` after a handler change.
