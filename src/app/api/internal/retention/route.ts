import { NextResponse } from "next/server";

import { purgeExpiredInquiries } from "@/lib/inquiries/maintenance";
import { getInquiryRepository } from "@/lib/inquiries/repository";
import { assertBearer, StaffAccessError } from "@/lib/staff/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertBearer(request, "NOTIFICATION_WORKER_TOKEN");
    const repository = getInquiryRepository();
    if (!repository) {
      return NextResponse.json(
        { ok: false, message: "Baza zgłoszeń nie jest skonfigurowana." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    const summary = await purgeExpiredInquiries(repository);
    return NextResponse.json(
      { ok: true, ...summary },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof StaffAccessError ? error.status : 503;
    const message =
      error instanceof StaffAccessError
        ? error.message
        : "Nie udało się wykonać retencji.";
    return NextResponse.json(
      { ok: false, message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
