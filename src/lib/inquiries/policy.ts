import type { InquiryStatus } from "@/lib/inquiries/model";
import { isInquiryStatus } from "@/lib/inquiries/model";
import { can } from "@/lib/staff/permissions";

export type InquiryCommand =
  | { type: "status"; status: string }
  | { type: "assign"; assigneeId: string | null }
  | { type: "note"; body: string };

export type InquiryCommandResult =
  | {
      ok: true;
      createsReservation: false;
      command:
        | { type: "status"; status: InquiryStatus }
        | { type: "assign"; assigneeId: string | null }
        | { type: "note"; body: string };
    }
  | { ok: false; reason: "forbidden" | "invalid"; message: string };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function applyInquiryCommand(
  role: string,
  command: InquiryCommand,
): InquiryCommandResult {
  if (command.type === "status") {
    if (!can(role, "inquiries.update")) {
      return { ok: false, reason: "forbidden", message: "Brak uprawnień do zmiany statusu." };
    }
    if (!isInquiryStatus(command.status)) {
      return { ok: false, reason: "invalid", message: "Nieznany status zgłoszenia." };
    }
    return {
      ok: true,
      createsReservation: false,
      command: { type: "status", status: command.status },
    };
  }

  if (command.type === "assign") {
    if (!can(role, "inquiries.assign")) {
      return { ok: false, reason: "forbidden", message: "Brak uprawnień do przypisania." };
    }
    if (command.assigneeId !== null && !UUID.test(command.assigneeId)) {
      return { ok: false, reason: "invalid", message: "Nieprawidłowy identyfikator pracownika." };
    }
    return {
      ok: true,
      createsReservation: false,
      command: { type: "assign", assigneeId: command.assigneeId },
    };
  }

  if (!can(role, "inquiries.note")) {
    return { ok: false, reason: "forbidden", message: "Brak uprawnień do notatki." };
  }
  const body = command.body.trim();
  if (body.length < 1 || body.length > 2_000) {
    return { ok: false, reason: "invalid", message: "Notatka musi mieć od 1 do 2000 znaków." };
  }
  return {
    ok: true,
    createsReservation: false,
    command: { type: "note", body },
  };
}
