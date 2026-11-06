import type { Metadata } from "next";

import { LoginForm } from "@/components/panel/login-form";
import { Container } from "@/components/ui";
import { isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Logowanie pracownika",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  config: "Panel nie jest jeszcze skonfigurowany. Brakuje bazy albo sekretu sesji.",
  disabled: "To konto jest zablokowane albo sesja wygasła.",
  staff: "To konto nie ma dostępu do panelu pracowników.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configured = isAuthConfigured();
  const notice = params.error ? errors[params.error] : undefined;

  return (
    <section className="section section--paper">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
          Paintball Strefa 29
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Logowanie pracownika</h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Dostęp mają tylko konta utworzone przez właściciela. Publiczna rejestracja jest wyłączona.
        </p>
        {notice ? (
          <p className="mt-4 max-w-xl rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
            {notice}
          </p>
        ) : null}
        <div className="mt-8">
          <LoginForm disabled={!configured} />
        </div>
      </Container>
    </section>
  );
}
