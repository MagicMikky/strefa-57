import { describe, expect, it } from "vitest";

import { applyInquiryCommand } from "@/lib/inquiries/policy";
import { authorize, can, loginProblem, passwordProblem, secretsMatch, staffEmailForLogin } from "@/lib/staff/permissions";

describe("staff permissions", () => {
  it("lets the owner manage staff and the employee only read and note", () => {
    expect(can("owner", "staff.manage")).toBe(true);
    expect(can("manager", "inquiries.update")).toBe(true);
    expect(can("manager", "staff.manage")).toBe(false);
    expect(can("employee", "inquiries.read")).toBe(true);
    expect(can("employee", "inquiries.update")).toBe(false);
    expect(can("guest", "inquiries.read")).toBe(false);
  });

  it("keeps sports and customer roles out of the staff panel", () => {
    for (const role of ["member", "customer", "player", "captain", "referee", "organizer"]) {
      expect(can(role, "inquiries.read")).toBe(false);
      expect(authorize(role, "staff.manage")).toBe("forbidden");
    }
  });

  it("rejects anonymous and cross-role access to staff data", () => {
    expect(authorize(null, "inquiries.read")).toBe("unauthenticated");
    expect(authorize("employee", "staff.manage")).toBe("forbidden");
    expect(authorize("owner", "staff.manage")).toBe("ok");
  });

  it("compares secrets without accepting a different length", () => {
    expect(secretsMatch("a".repeat(32), "a".repeat(32))).toBe(true);
    expect(secretsMatch("a".repeat(32), "b".repeat(32))).toBe(false);
    expect(secretsMatch("a".repeat(32), "a".repeat(31))).toBe(false);
  });

  it("accepts a staff login without treating it as an email address", () => {
    expect(loginProblem("Kopik1230")).toBeNull();
    expect(staffEmailForLogin("Kopik1230")).toBe("kopik1230@staff.invalid");
    expect(loginProblem("a")).toBeTruthy();
    expect(loginProblem("has space")).toBeTruthy();
  });

  it("requires a long password with a letter and a digit", () => {
    expect(passwordProblem("short1")).toBeTruthy();
    expect(passwordProblem("longpassword")).toBeTruthy();
    expect(passwordProblem("longpassword1")).toBeNull();
  });
});

describe("inquiry commands", () => {
  it("does not treat a status change as a reservation", () => {
    const result = applyInquiryCommand("manager", { type: "status", status: "handled" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.createsReservation).toBe(false);
    }
  });

  it("blocks an employee from assigning or changing status", () => {
    expect(applyInquiryCommand("employee", { type: "status", status: "closed" }).ok).toBe(false);
    expect(applyInquiryCommand("employee", { type: "assign", assigneeId: null }).ok).toBe(false);
    expect(applyInquiryCommand("employee", { type: "note", body: "Oddzwonić jutro" }).ok).toBe(true);
  });

  it("rejects an unknown status and an empty note", () => {
    expect(applyInquiryCommand("owner", { type: "status", status: "booked" }).ok).toBe(false);
    expect(applyInquiryCommand("manager", { type: "note", body: "   " }).ok).toBe(false);
  });
});
