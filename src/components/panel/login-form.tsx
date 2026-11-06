"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      if (!response.ok) {
        setError("Nieprawidłowy e-mail lub hasło.");
        return;
      }
      router.push("/panel");
      router.refresh();
    } catch {
      setError("Logowanie jest chwilowo niedostępne.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid max-w-md gap-4" onSubmit={onSubmit}>
      <label className="grid gap-2 text-sm font-semibold" htmlFor="staff-email">
        E-mail
        <input
          id="staff-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={disabled}
          className="rounded-xl border border-black/15 bg-white px-3 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold" htmlFor="staff-password">
        Hasło
        <input
          id="staff-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
          className="rounded-xl border border-black/15 bg-white px-3 py-3"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
      <button
        className="rounded-full bg-[var(--forest)] px-5 py-3 font-semibold text-white disabled:opacity-50"
        type="submit"
        disabled={disabled || pending}
      >
        Zaloguj
      </button>
    </form>
  );
}
