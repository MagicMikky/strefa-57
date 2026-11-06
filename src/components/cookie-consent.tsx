"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CONSENT_STORAGE_KEY, saveConsent, type ConsentPreferences } from "@/lib/consent";

const serverSnapshot = "__server__";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("strefa29:consent-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("strefa29:consent-change", callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "";
}

function parseSnapshot(snapshot: string): ConsentPreferences | null {
  if (!snapshot || snapshot === serverSnapshot) return null;
  try {
    const parsed = JSON.parse(snapshot) as Partial<ConsentPreferences>;
    if (parsed.essential !== true || typeof parsed.analytics !== "boolean") return null;
    return {
      essential: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  const preferences = useMemo(() => parseSnapshot(snapshot), [snapshot]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  function commit(nextAnalytics: boolean) {
    const next = saveConsent(nextAnalytics);
    setAnalytics(nextAnalytics);
    setSettingsOpen(false);
    return next;
  }

  if (snapshot === serverSnapshot) return null;

  const firstVisit = preferences === null;
  const visible = firstVisit || settingsOpen;

  return (
    <>
      {visible ? (
        <section className="consent-panel" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <div className="consent-panel__icon"><Icon name="shield" width={24} height={24} /></div>
          <div className="consent-panel__copy">
            <p className="consent-panel__eyebrow">Twoja prywatność</p>
            <h2 id="consent-title">Ty decydujesz o opcjonalnych cookies.</h2>
            <p>
              Niezbędne mechanizmy zapewniają działanie strony. Analityczne pomagają zrozumieć, które treści są przydatne — bez przesyłania danych z formularza.
              {" "}<Link href="/cookies">Dowiedz się więcej</Link>.
            </p>
            {settingsOpen ? (
              <div className="consent-options">
                <label><input type="checkbox" checked disabled /> <span><strong>Niezbędne</strong><small>Zawsze aktywne</small></span></label>
                <label><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /> <span><strong>Analityczne</strong><small>Pomiar anonimowych zdarzeń</small></span></label>
              </div>
            ) : null}
          </div>
          <div className="consent-panel__actions">
            {settingsOpen ? (
              <button className="button button--primary" type="button" onClick={() => commit(analytics)}>Zapisz wybór</button>
            ) : (
              <>
                <button className="button button--primary" type="button" onClick={() => commit(true)}>Akceptuj analityczne</button>
                <button className="button button--outline-dark" type="button" onClick={() => commit(false)}>Tylko niezbędne</button>
                <button className="consent-panel__settings" type="button" onClick={() => setSettingsOpen(true)}>Ustawienia</button>
              </>
            )}
          </div>
        </section>
      ) : (
        <button className="consent-reopen" type="button" onClick={() => { setAnalytics(preferences?.analytics ?? false); setSettingsOpen(true); }}>
          <Icon name="shield" width={17} height={17} /> Ustawienia cookies
        </button>
      )}
    </>
  );
}
