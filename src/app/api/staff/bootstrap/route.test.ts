import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("POST /api/staff/bootstrap", () => {
  it("does not expose the bootstrap route without a configured token", async () => {
    delete process.env.STAFF_BOOTSTRAP_TOKEN;
    const response = await POST(
      new Request("http://localhost:3000/api/staff/bootstrap", { method: "POST" }),
    );
    expect(response.status).toBe(404);
  });

  it("rejects a wrong token before touching the database", async () => {
    process.env.STAFF_BOOTSTRAP_TOKEN = "0123456789abcdef0123456789abcdef";
    const response = await POST(
      new Request("http://localhost:3000/api/staff/bootstrap", {
        method: "POST",
        headers: {
          authorization: "Bearer not-the-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ password: "longpassword1" }),
      }),
    );
    delete process.env.STAFF_BOOTSTRAP_TOKEN;
    expect(response.status).toBe(401);
    expect(await response.text()).not.toContain("longpassword1");
  });

  it("does not create an owner when the database is unavailable", async () => {
    process.env.STAFF_BOOTSTRAP_TOKEN = "0123456789abcdef0123456789abcdef";
    delete process.env.DATABASE_URL;
    const response = await POST(
      new Request("http://localhost:3000/api/staff/bootstrap", {
        method: "POST",
        headers: {
          authorization: "Bearer 0123456789abcdef0123456789abcdef",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Wlasciciel",
          email: "owner@example.com",
          password: "longpassword1",
        }),
      }),
    );
    delete process.env.STAFF_BOOTSTRAP_TOKEN;
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("longpassword1");
  });
});
