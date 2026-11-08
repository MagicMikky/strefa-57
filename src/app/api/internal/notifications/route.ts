import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "Wysyłka zgłoszeń e-mailem jest wyłączona. Zgłoszenia są obsługiwane w panelu.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
