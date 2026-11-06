import { retentionCutoff } from "@/lib/inquiries/retention";
import { can } from "@/lib/staff/permissions";
import { requireStaff } from "@/lib/staff/session";
import { changeOwnPassword } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const staff = await requireStaff();
  const params = await searchParams;
  const retention = retentionCutoff();

  return (
    <div className="grid max-w-xl gap-8">
      <h2 className="text-2xl font-black">Ustawienia</h2>
      {params.saved ? <p role="status">Hasło zostało zmienione. Pozostałe sesje zostały unieważnione.</p> : null}
      {params.error ? (
        <p role="alert">Nie udało się zmienić hasła. Sprawdź obecne hasło i wymagania nowego.</p>
      ) : null}
      <form action={changeOwnPassword} className="grid gap-3 rounded-3xl bg-white p-5">
        <h3 className="text-xl font-black">Hasło</h3>
        <label className="grid gap-1 text-sm font-semibold">
          Obecne hasło
          <input className="rounded-xl border border-black/15 px-3 py-2" name="currentPassword" type="password" required autoComplete="current-password" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Nowe hasło
          <input className="rounded-xl border border-black/15 px-3 py-2" name="newPassword" type="password" required minLength={12} autoComplete="new-password" />
        </label>
        <button className="w-fit rounded-full bg-[var(--forest)] px-4 py-2 font-semibold text-white" type="submit">
          Zmień hasło
        </button>
      </form>
      {can(staff.role, "settings.manage") ? (
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <h3 className="text-xl font-black">Retencja danych</h3>
          <p className="mt-2 text-sm leading-6">
            {retention
              ? "Usuwanie zgłoszeń starszych niż skonfigurowana liczba dni jest włączone. Okres pochodzi ze zmiennej DATA_RETENTION_DAYS i nie jest zapisany w kodzie."
              : "Okres retencji nie został zatwierdzony. Mechanizm usuwania nic nie kasuje, dopóki właściciel nie ustawi DATA_RETENTION_DAYS."}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            MFA jest przygotowane jako pole konta, ale nie jest jeszcze włączone dla logowania.
          </p>
        </section>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Ustawienia firmy i kont pracowników są dostępne dla właściciela.
        </p>
      )}
    </div>
  );
}
