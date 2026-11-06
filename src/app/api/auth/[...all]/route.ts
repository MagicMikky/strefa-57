import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

import { getAuth, isAuthConfigured } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json(
    { ok: false, message: "Logowanie jest chwilowo niedostępne." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

async function dispatch(request: Request, method: Method) {
  if (!isAuthConfigured()) {
    return unavailable();
  }
  const handler = toNextJsHandler(getAuth());
  return handler[method](request);
}

export function GET(request: Request) {
  return dispatch(request, "GET");
}

export function POST(request: Request) {
  return dispatch(request, "POST");
}

export function PATCH(request: Request) {
  return dispatch(request, "PATCH");
}

export function PUT(request: Request) {
  return dispatch(request, "PUT");
}

export function DELETE(request: Request) {
  return dispatch(request, "DELETE");
}
