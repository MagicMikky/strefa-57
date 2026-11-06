import { describe, it, expect } from "vitest";
import { validateInquiry, getWarsawDate } from "./inquiry";

describe("validateInquiry", () => {
  it("accepts a minimal valid inquiry", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const preferredDate = getWarsawDate(tomorrow);

    const input = {
      playerCount: 5,
      preferredDate,
      preferredTime: "12:00",
      alternateDate: "",
      packageId: "pakiet1",
      eventType: "znajomi",
      name: "Jan",
      preferredContact: "email",
      phone: "",
      email: "jan@example.com",
      message: "Cześć",
      privacyAccepted: true,
      website: "",
    };

    const result = validateInquiry(input, new Date());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.playerCount).toBe(5);
      expect(result.data.email).toBe("jan@example.com");
    }
  });

  it("rejects invalid email and date in the past", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const preferredDate = getWarsawDate(yesterday);

    const input = {
      playerCount: 0,
      preferredDate,
      preferredTime: "",
      alternateDate: "2020-01-01",
      packageId: "!bad",
      eventType: "unknown",
      name: "A",
      preferredContact: "phone",
      phone: "123",
      email: "not-an-email",
      message: "",
      privacyAccepted: false,
      website: "",
    };

    const result = validateInquiry(input, new Date());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors).toBeDefined();
      expect(Object.keys(result.fieldErrors!).length).toBeGreaterThan(0);
    }
  });
});
import { describe, expect, it } from "vitest";

import {
  INQUIRY_SUCCESS_MESSAGE,
  MAX_MESSAGE_LENGTH,
  getWarsawDate,
  validateInquiry,
} from "./inquiry";

const now = new Date("2026-09-22T10:00:00.000Z");

function validPayload() {
  return {
    playerCount: 12,
    preferredDate: "2026-09-23",
    preferredTime: "12:00",
    alternateDate: "2026-09-24",
    packageId: "pakiet-500",
    eventType: "znajomi",
    name: "  Anna Kowalska  ",
    preferredContact: "email",
    phone: "",
    email: "  ANNA@example.com ",
    message: "  Proszę o kontakt.\r\nDziękuję.  ",
    privacyAccepted: true,
    website: "",
  };
}

describe("validateInquiry", () => {
  it("accepts and normalizes a complete e-mail inquiry", () => {
    const result = validateInquiry(validPayload(), now);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.name).toBe("Anna Kowalska");
    expect(result.data.email).toBe("anna@example.com");
    expect(result.data.message).toBe("Proszę o kontakt.\nDziękuję.");
  });

  it("accepts phone as the only contact channel", () => {
    const payload = {
      ...validPayload(),
      preferredContact: "phone",
      phone: "+48 500 600 700",
      email: "",
    };

    const result = validateInquiry(payload, now);
    expect(result.ok).toBe(true);
  });

  it("requires the selected contact detail", () => {
    const emailResult = validateInquiry(
      { ...validPayload(), email: "" },
      now,
    );
    const phoneResult = validateInquiry(
      {
        ...validPayload(),
        preferredContact: "phone",
        phone: "",
        email: "",
      },
      now,
    );

    expect(emailResult.ok).toBe(false);
    expect(phoneResult.ok).toBe(false);
    if (!emailResult.ok && !phoneResult.ok) {
      expect(emailResult.fieldErrors.email).toBeDefined();
      expect(phoneResult.fieldErrors.phone).toBeDefined();
    }
  });

  it("rejects a non-integer player count and a non-future preferred date", () => {
    const result = validateInquiry(
      {
        ...validPayload(),
        playerCount: 12.5,
        preferredDate: "2026-09-22",
      },
      now,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.playerCount).toBeDefined();
      expect(result.fieldErrors.preferredDate).toBeDefined();
    }
  });

  it("allows today as an alternate date but rejects a past date", () => {
    const todayResult = validateInquiry(
      { ...validPayload(), alternateDate: "2026-09-22" },
      now,
    );
    const pastResult = validateInquiry(
      { ...validPayload(), alternateDate: "2026-09-21" },
      now,
    );

    expect(todayResult.ok).toBe(true);
    expect(pastResult.ok).toBe(false);
    if (!pastResult.ok) {
      expect(pastResult.fieldErrors.alternateDate).toBeDefined();
    }
  });

  it("rejects invalid enums, package identifiers and control characters", () => {
    const result = validateInquiry(
      {
        ...validPayload(),
        preferredTime: "11:15",
        eventType: "nieznane",
        packageId: "../../admin",
        name: "Anna\u0000",
      },
      now,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.preferredTime).toBeDefined();
      expect(result.fieldErrors.eventType).toBeDefined();
      expect(result.fieldErrors.packageId).toBeDefined();
      expect(result.fieldErrors.name).toBeDefined();
    }
  });

  it("requires privacy acceptance and enforces the message limit", () => {
    const result = validateInquiry(
      {
        ...validPayload(),
        privacyAccepted: false,
        message: "a".repeat(MAX_MESSAGE_LENGTH + 1),
      },
      now,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.privacyAccepted).toBeDefined();
      expect(result.fieldErrors.message).toBeDefined();
    }
  });

  it("rejects non-object input without throwing", () => {
    expect(validateInquiry(null, now).ok).toBe(false);
    expect(validateInquiry("not-json", now).ok).toBe(false);
    expect(validateInquiry([], now).ok).toBe(false);
  });
});

describe("date and copy contracts", () => {
  it("calculates the business date in Europe/Warsaw", () => {
    expect(getWarsawDate(new Date("2026-03-29T22:30:00.000Z"))).toBe(
      "2026-03-30",
    );
  });

  it("states explicitly that an inquiry is not a reservation", () => {
    expect(INQUIRY_SUCCESS_MESSAGE).toContain(
      "nie jest jeszcze zarezerwowany ani zablokowany",
    );
  });
});
