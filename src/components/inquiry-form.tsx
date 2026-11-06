"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { eventTypeForAudience } from "@/data/site";
import { trackEvent } from "@/lib/consent";
import {
  MAX_MESSAGE_LENGTH,
  MAX_PLAYER_COUNT,
  MIN_PLAYER_COUNT,
  eventTypeOptions,
  getWarsawDate,
  preferredContactOptions,
  preferredTimeOptions,
  type InquiryApiResponse,
  type InquiryField,
  type InquiryFieldErrors,
  type InquiryPayload,
  type PreferredContact,
  validateInquiry,
} from "@/lib/inquiry";

export interface InquiryPackageOption {
  id: string;
  name: string;
}

export interface InquiryFormProps {
  packages?: readonly InquiryPackageOption[];
  initialPackageId?: string;
  initialEventType?: string;
  initialDate?: string;
  initialPlayers?: number;
  initialMessage?: string;
}

type FormStatus =
  | { kind: "idle"; message: "" }
  | { kind: "error" | "success"; message: string };

const inputClassName =
  "mt-2 w-full rounded-lg border border-stone-400 bg-white px-3 py-2 text-stone-950 shadow-sm outline-none transition focus:border-lime-700 focus:ring-2 focus:ring-lime-700/30 disabled:cursor-not-allowed disabled:bg-stone-100";
const labelClassName = "block text-sm font-semibold text-stone-900";
const fieldsetClassName =
  "rounded-xl border border-stone-300 bg-white/80 p-5 sm:p-6";

function tomorrowInWarsaw(): string {
  const today = getWarsawDate();
  const date = new Date(today + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function fieldErrorId(field: InquiryField): string {
  return "inquiry-" + field + "-error";
}

function describedBy(
  field: InquiryField,
  errors: InquiryFieldErrors,
  hintId?: string,
): string | undefined {
  const ids = [
    hintId,
    errors[field] ? fieldErrorId(field) : undefined,
  ].filter(Boolean);

  return ids.length > 0 ? ids.join(" ") : undefined;
}

function FieldError({
  field,
  errors,
}: {
  field: InquiryField;
  errors: InquiryFieldErrors;
}) {
  const error = errors[field];
  if (!error) {
    return null;
  }

  return (
    <p
      className="mt-2 text-sm font-medium text-red-800"
      id={fieldErrorId(field)}
    >
      {error}
    </p>
  );
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-red-700">
      {" "}
      *
    </span>
  );
}

function FormSection({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={fieldsetClassName}>
      <legend className="px-2 text-lg font-bold text-stone-950">
        {legend}
      </legend>
      <div className="mt-2 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function isInquiryApiResponse(value: unknown): value is InquiryApiResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { ok?: unknown }).ok === "boolean" &&
    typeof (value as { message?: unknown }).message === "string"
  );
}

function focusFirstInvalidField(
  form: HTMLFormElement,
  errors: InquiryFieldErrors,
): void {
  const firstField = Object.keys(errors)[0] as InquiryField | undefined;
  if (!firstField) {
    return;
  }

  const element = form.elements.namedItem(firstField);
  if (element instanceof HTMLElement) {
    element.focus();
  }
}

export function InquiryForm({
  packages = [],
  initialPackageId,
  initialEventType,
  initialDate,
  initialPlayers,
  initialMessage,
}: InquiryFormProps) {
  const packageOptions = useMemo(() => {
    const unique = new Map<string, InquiryPackageOption>();
    unique.set("nie-wiem", {
      id: "nie-wiem",
      name: "Nie wiem — proszę o pomoc w wyborze",
    });

    for (const item of packages) {
      if (item.id && item.name) {
        unique.set(item.id, item);
      }
    }

    return Array.from(unique.values());
  }, [packages]);

  const selectedInitialPackage = packageOptions.some(
    (item) => item.id === initialPackageId,
  )
    ? initialPackageId
    : "nie-wiem";
  const normalizedEventType = eventTypeForAudience(initialEventType);
  const selectedInitialEventType = eventTypeOptions.some(
    (item) => item.value === normalizedEventType,
  )
    ? normalizedEventType
    : "";

  const [preferredContact, setPreferredContact] =
    useState<PreferredContact>("email");
  const [fieldErrors, setFieldErrors] = useState<InquiryFieldErrors>({});
  const [status, setStatus] = useState<FormStatus>({
    kind: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inquiryStarted = useRef(false);

  function handleInquiryStart() {
    if (inquiryStarted.current) return;
    inquiryStarted.current = true;
    trackEvent("inquiry_start");
  }

  const today = getWarsawDate();
  const minimumPreferredDate = tomorrowInWarsaw();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const playerCountValue = asString(formData.get("playerCount"));

    const payload: InquiryPayload = {
      playerCount: Number(playerCountValue),
      preferredDate: asString(formData.get("preferredDate")),
      preferredTime: asString(formData.get("preferredTime")),
      alternateDate: asString(formData.get("alternateDate")),
      packageId: asString(formData.get("packageId")),
      eventType: asString(formData.get("eventType")),
      name: asString(formData.get("name")),
      preferredContact: asString(formData.get("preferredContact")),
      phone: asString(formData.get("phone")),
      email: asString(formData.get("email")),
      message: asString(formData.get("message")),
      privacyAccepted: formData.get("privacyAccepted") === "on",
      website: asString(formData.get("website")),
    };

    const clientValidation = validateInquiry(payload);
    if (!clientValidation.ok) {
      trackEvent("inquiry_error", { stage: "validation" });
      setFieldErrors(clientValidation.fieldErrors);
      setStatus({ kind: "error", message: clientValidation.message });
      requestAnimationFrame(() =>
        focusFirstInvalidField(form, clientValidation.fieldErrors),
      );
      return;
    }

    setFieldErrors({});
    setStatus({ kind: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientValidation.data),
      });
      const rawResponse: unknown = await response.json().catch(() => null);

      if (!isInquiryApiResponse(rawResponse)) {
        trackEvent("inquiry_error", { stage: "response", status: response.status });
        setStatus({
          kind: "error",
          message:
            "Serwer zwrócił nieprawidłową odpowiedź. Spróbuj ponownie lub skontaktuj się z obsługą bezpośrednio.",
        });
        return;
      }

      if (!response.ok || !rawResponse.ok) {
        const serverErrors =
          "fieldErrors" in rawResponse && rawResponse.fieldErrors
            ? rawResponse.fieldErrors
            : {};
        trackEvent("inquiry_error", { stage: "server", status: response.status });
        setFieldErrors(serverErrors);
        setStatus({ kind: "error", message: rawResponse.message });
        requestAnimationFrame(() =>
          focusFirstInvalidField(form, serverErrors),
        );
        return;
      }

      trackEvent("inquiry_submit", { status: response.status });
      form.reset();
      setPreferredContact("email");
      setFieldErrors({});
      setStatus({ kind: "success", message: rawResponse.message });
    } catch {
      trackEvent("inquiry_error", { stage: "network" });
      setStatus({
        kind: "error",
        message:
          "Nie udało się połączyć z serwerem. Dane pozostały w formularzu — sprawdź połączenie i spróbuj ponownie.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="inquiry-form-title"
      className="mx-auto w-full max-w-3xl"
    >
      <div className="mb-6 rounded-xl border border-amber-500/50 bg-amber-50 p-4 text-amber-950">
        <h2 className="font-bold" id="inquiry-form-title">
          Zapytaj o termin
        </h2>
        <p className="mt-1 text-sm leading-6">
          Ten formularz wysyła zapytanie do obsługi. Nie sprawdza dostępności,
          nie blokuje terminu i nie tworzy rezerwacji. Termin jest uzgodniony
          dopiero po osobnym potwierdzeniu przez obsługę.
        </p>
      </div>

      <form
        className="grid gap-6"
        method="post"
        noValidate
        onFocus={handleInquiryStart}
        onSubmit={handleSubmit}
      >
        <FormSection legend="Planowana gra">
          <div>
            <label className={labelClassName} htmlFor="inquiry-player-count">
              Liczba graczy
              <RequiredMark />
            </label>
            <input
              aria-describedby={describedBy("playerCount", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.playerCount)}
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-player-count"
              inputMode="numeric"
              max={MAX_PLAYER_COUNT}
              min={MIN_PLAYER_COUNT}
              defaultValue={initialPlayers}
              name="playerCount"
              required
              step={1}
              type="number"
            />
            <FieldError errors={fieldErrors} field="playerCount" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-package">
              Pakiet
              <RequiredMark />
            </label>
            <select
              aria-describedby={describedBy("packageId", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.packageId)}
              className={inputClassName}
              defaultValue={selectedInitialPackage}
              disabled={isSubmitting}
              id="inquiry-package"
              name="packageId"
              required
            >
              {packageOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <FieldError errors={fieldErrors} field="packageId" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-preferred-date">
              Preferowana data
              <RequiredMark />
            </label>
            <input
              aria-describedby={describedBy(
                "preferredDate",
                fieldErrors,
                "inquiry-date-hint",
              )}
              aria-invalid={Boolean(fieldErrors.preferredDate)}
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-preferred-date"
              min={minimumPreferredDate}
              defaultValue={initialDate}
              name="preferredDate"
              required
              suppressHydrationWarning
              type="date"
            />
            <p className="mt-2 text-xs text-stone-600" id="inquiry-date-hint">
              Wskazanie daty nie oznacza jej dostępności.
            </p>
            {initialMessage ? <p className="mt-2 text-xs text-stone-600">Wybrany slot jest preferencją. Wysłanie formularza nie rezerwuje terminu.</p> : null}
            <FieldError errors={fieldErrors} field="preferredDate" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-preferred-time">
              Preferowana pora
            </label>
            <select
              aria-describedby={describedBy("preferredTime", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.preferredTime)}
              className={inputClassName}
              defaultValue=""
              disabled={isSubmitting}
              id="inquiry-preferred-time"
              name="preferredTime"
            >
              {preferredTimeOptions.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError errors={fieldErrors} field="preferredTime" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-alternate-date">
              Termin alternatywny
            </label>
            <input
              aria-describedby={describedBy("alternateDate", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.alternateDate)}
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-alternate-date"
              min={today}
              name="alternateDate"
              suppressHydrationWarning
              type="date"
            />
            <FieldError errors={fieldErrors} field="alternateDate" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-event-type">
              Rodzaj wydarzenia
              <RequiredMark />
            </label>
            <select
              aria-describedby={describedBy("eventType", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.eventType)}
              className={inputClassName}
              defaultValue={selectedInitialEventType}
              disabled={isSubmitting}
              id="inquiry-event-type"
              name="eventType"
              required
            >
              <option disabled value="">
                Wybierz rodzaj wydarzenia
              </option>
              {eventTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError errors={fieldErrors} field="eventType" />
          </div>
        </FormSection>

        <FormSection legend="Dane organizatora">
          <div className="sm:col-span-2">
            <label className={labelClassName} htmlFor="inquiry-name">
              Imię organizatora
              <RequiredMark />
            </label>
            <input
              aria-describedby={describedBy("name", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="name"
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-name"
              maxLength={100}
              name="name"
              required
              type="text"
            />
            <FieldError errors={fieldErrors} field="name" />
          </div>

          <div className="sm:col-span-2">
            <span className={labelClassName}>
              Preferowany sposób kontaktu
              <RequiredMark />
            </span>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {preferredContactOptions.map((option) => (
                <label
                  className="inline-flex items-center gap-2 text-stone-900"
                  key={option.value}
                >
                  <input
                    checked={preferredContact === option.value}
                    disabled={isSubmitting}
                    name="preferredContact"
                    onChange={() =>
                      setPreferredContact(option.value as PreferredContact)
                    }
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <FieldError errors={fieldErrors} field="preferredContact" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-phone">
              Telefon
              {preferredContact === "phone" ? <RequiredMark /> : null}
            </label>
            <input
              aria-describedby={describedBy(
                "phone",
                fieldErrors,
                "inquiry-phone-hint",
              )}
              aria-invalid={Boolean(fieldErrors.phone)}
              autoComplete="tel"
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-phone"
              inputMode="tel"
              maxLength={30}
              name="phone"
              required={preferredContact === "phone"}
              type="tel"
            />
            <p className="mt-2 text-xs text-stone-600" id="inquiry-phone-hint">
              Wymagany, jeśli wybierzesz kontakt telefoniczny.
            </p>
            <FieldError errors={fieldErrors} field="phone" />
          </div>

          <div>
            <label className={labelClassName} htmlFor="inquiry-email">
              E-mail
              {preferredContact === "email" ? <RequiredMark /> : null}
            </label>
            <input
              aria-describedby={describedBy(
                "email",
                fieldErrors,
                "inquiry-email-hint",
              )}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-email"
              maxLength={254}
              name="email"
              required={preferredContact === "email"}
              type="email"
            />
            <p className="mt-2 text-xs text-stone-600" id="inquiry-email-hint">
              Wymagany, jeśli wybierzesz kontakt e-mailowy.
            </p>
            <FieldError errors={fieldErrors} field="email" />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClassName} htmlFor="inquiry-message">
              Dodatkowa wiadomość
            </label>
            <textarea
              aria-describedby={describedBy(
                "message",
                fieldErrors,
                "inquiry-message-hint",
              )}
              aria-invalid={Boolean(fieldErrors.message)}
              className={inputClassName}
              disabled={isSubmitting}
              id="inquiry-message"
              maxLength={MAX_MESSAGE_LENGTH}
              defaultValue={initialMessage}
              name="message"
              rows={5}
            />
            <p
              className="mt-2 text-xs text-stone-600"
              id="inquiry-message-hint"
            >
              Maksymalnie {MAX_MESSAGE_LENGTH} znaków. Nie wpisuj danych
              uczestników.
            </p>
            <FieldError errors={fieldErrors} field="message" />
          </div>
        </FormSection>

        <div
          aria-hidden="true"
          style={{
            height: 0,
            left: "-10000px",
            overflow: "hidden",
            position: "absolute",
            width: 0,
          }}
        >
          <label htmlFor="inquiry-website">Strona internetowa</label>
          <input
            autoComplete="off"
            id="inquiry-website"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </div>

        <div className="rounded-xl border border-stone-300 bg-white/80 p-5 sm:p-6">
          <label className="flex items-start gap-3 text-sm leading-6 text-stone-900">
            <input
              aria-describedby={describedBy("privacyAccepted", fieldErrors)}
              aria-invalid={Boolean(fieldErrors.privacyAccepted)}
              className="mt-1 size-4 shrink-0 accent-lime-800"
              disabled={isSubmitting}
              name="privacyAccepted"
              required
              type="checkbox"
            />
            <span>
              Zapoznałem(-am) się z{" "}
              <a
                className="font-semibold text-lime-900 underline underline-offset-2"
                href="/polityka-prywatnosci"
              >
                polityką prywatności
              </a>
              .<RequiredMark />
            </span>
          </label>
          <FieldError errors={fieldErrors} field="privacyAccepted" />
        </div>

        {status.kind !== "idle" ? (
          <div
            aria-live={status.kind === "success" ? "polite" : "assertive"}
            className={
              status.kind === "success"
                ? "rounded-xl border border-green-700/40 bg-green-50 p-4 text-green-950"
                : "rounded-xl border border-red-700/40 bg-red-50 p-4 text-red-950"
            }
            role={status.kind === "error" ? "alert" : "status"}
          >
            <p className="font-semibold">
              {status.kind === "success"
                ? "Zapytanie wysłane"
                : "Nie udało się wysłać formularza"}
            </p>
            <p className="mt-1 text-sm leading-6">{status.message}</p>
          </div>
        ) : null}

        <div>
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-lime-800 px-6 py-3 font-bold text-white transition hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-700 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Wysyłanie…" : "Wyślij zapytanie"}
          </button>
          <p className="mt-3 text-sm text-stone-700">
            Wysłanie formularza nie rezerwuje ani nie blokuje terminu.
          </p>
        </div>
      </form>
    </section>
  );
}
