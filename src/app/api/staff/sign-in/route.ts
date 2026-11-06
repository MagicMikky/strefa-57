import { NextResponse } from "next/server";

import { getAuth, isAuthConfigured } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { emailProblem, loginProblem, normalizeLogin } from "@/lib/staff/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function denied() {
  return NextResponse.json(
    { ok: false, message: "Nieprawidłowy login lub hasło." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!isAuthConfigured() || !process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, message: "Logowanie jest chwilowo niedostępne." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return denied();
  }
  if (typeof body !== "object" || body === null) return denied();
  const source = body as Record<string, unknown>;
  const raw = String(source.login ?? source.email ?? "").trim();
  const password = String(source.password ?? "");
  if (!raw || !password) return denied();

  let email = "";
  if (raw.includes("@")) {
    if (emailProblem(raw)) return denied();
    email = raw.toLowerCase();
  } else {
    if (loginProblem(raw)) return denied();
    try {
      const user = await getPrisma().user.findUnique({
        where: { login: normalizeLogin(raw) },
        select: { email: true },
      });
      email = user?.email ?? "";
    } catch {
      return NextResponse.json(
        { ok: false, message: "Logowanie jest chwilowo niedostępne." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  }
  if (!email) return denied();

  return getAuth().api.signInEmail({
    body: { email, password },
    asResponse: true,
    headers: request.headers,
  });
}
