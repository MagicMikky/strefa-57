import { describe, expect, it } from "vitest";
import { eventTypeForAudience } from "@/data/site";
import {
  INQUIRY_SUCCESS_MESSAGE,
  MAX_MESSAGE_LENGTH,
  getWarsawDate,
  validateInquiry,
} from "./inquiry";

describe("validateInquiry", () => {
  it("accepts a minimal valid inquiry", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const preferredDate = getWarsawDate(tomorrow);

    const input = {
      playerCount: 8,
      preferredDate,
      preferredTime: "12:00",
      alternateDate: "",
      packageId: "pierwsza-misja",
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
      expect(result.data.playerCount).toBe(8);
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

const now = new Date("2026-09-22T10:00:00.000Z");

function validPayload() {
  return {
    playerCount: 12,
    preferredDate: "2026-09-23",
    preferredTime: "12:00",
    alternateDate: "2026-09-24",
    packageId: "pelne-natarcie",
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

  it("rejects a non-integer player count and a past preferred date", () => {
    const result = validateInquiry(
      {
        ...validPayload(),
        playerCount: 12.5,
        preferredDate: "2026-09-21",
      },
      now,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.playerCount).toBeDefined();
      expect(result.fieldErrors.preferredDate).toBeDefined();
    }
  });

  it("allows today as the preferred date and rejects yesterday", () => {
    const todayResult = validateInquiry({ ...validPayload(), preferredDate: "2026-09-22" }, now);
    const pastResult = validateInquiry({ ...validPayload(), preferredDate: "2026-09-21" }, now);
    expect(todayResult.ok).toBe(true);
    expect(pastResult.ok).toBe(false);
    if (!pastResult.ok) expect(pastResult.fieldErrors.preferredDate).toBe("Preferowana data nie może być datą z przeszłości.");
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

  it("accepts a published slot start and still rejects an unlisted time", () => {
    const starts = ["08:00", "11:00", "14:00"];
    const accepted = validateInquiry({ ...validPayload(), preferredTime: "11:00" }, now, starts);
    const rejected = validateInquiry({ ...validPayload(), preferredTime: "11:15" }, now, starts);
    expect(accepted.ok).toBe(true);
    if (accepted.ok) expect(accepted.data.preferredTime).toBe("11:00");
    expect(rejected.ok).toBe(false);
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

describe("package and audience contracts", () => {
  it("accepts published package ids and the unknown option", () => {
    for (const packageId of ["pierwsza-misja", "pelne-natarcie", "wydarzenie", "nie-wiem"]) {
      const result = validateInquiry({ ...validPayload(), packageId }, now);
      expect(result.ok).toBe(true);
    }
  });

  it("rejects a package id that only matches the old format pattern", () => {
    const result = validateInquiry({ ...validPayload(), packageId: "pakiet-500" }, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.packageId).toBeDefined();
    }
  });

  it("maps audience slugs onto inquiry event types", () => {
    expect(eventTypeForAudience("kawalerskie")).toBe("kawalerskie-panienskie");
    expect(eventTypeForAudience("firmy")).toBe("firma");
    expect(eventTypeForAudience("szkoly")).toBe("szkola");
    expect(eventTypeForAudience("znajomi")).toBe("znajomi");
    expect(eventTypeForAudience("firma")).toBe("firma");
  });
});
