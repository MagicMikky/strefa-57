import { NextResponse } from "next/server";

import { assertBearer, createInitialOwner, StaffAccessError } from "@/lib/staff/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, message: string) {
  return NextResponse.json(
    { ok: status < 300, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  try {
    assertBearer(request, "STAFF_BOOTSTRAP_TOKEN");
  } catch (error) {
    if (error instanceof StaffAccessError) {
      return json(error.status, error.message);
    }
    return json(503, "Nie udało się utworzyć konta.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, "Nie udało się odczytać danych.");
  }

  if (typeof body !== "object" || body === null) {
    return json(422, "Podaj dane właściciela.");
  }
  const source = body as Record<string, unknown>;

  try {
    await createInitialOwner({
      name: String(source.name ?? ""),
      email: String(source.email ?? ""),
      password: String(source.password ?? ""),
    });
  } catch (error) {
    if (error instanceof StaffAccessError) {
      return json(error.status, error.message);
    }
    return json(503, "Nie udało się utworzyć konta.");
  }

  return json(201, "Konto właściciela zostało utworzone.");
}
