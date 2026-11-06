import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { TrackedLink } from "@/components/tracked-link";
import type { FaqItem, OfferPackage } from "@/data/site";

export function PackageCard({ item }: { item: OfferPackage }) {
  return (
    <article className={`package-card${item.featured ? " package-card--featured" : ""}`}>
      {item.featured ? <span className="package-card__badge">Polecany punkt startu</span> : null}
      <p className="package-card__eyebrow">{item.eyebrow}</p>
      <h3>{item.name}</h3>
      <p className="package-card__price">{item.price}</p>
      <p className="package-card__description">{item.description}</p>
      <ul>
        {item.features.map((feature) => (
          <li key={feature}><Icon name="check" width={17} height={17} /> {feature}</li>
        ))}
      </ul>
      <TrackedLink className="package-card__link" eventName="package_inquiry_click" eventProperties={{ packageId: item.id }} href={`/zapytaj-o-termin?pakiet=${item.id}`}>
        Zapytaj o ten pakiet <Icon name="arrow" width={18} height={18} />
      </TrackedLink>
    </article>
  );
}

export function FaqList({ items, limit }: { items: FaqItem[]; limit?: number }) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  return (
    <div className="faq-list">
      {visible.map((item, index) => (
        <details key={item.question} className="faq-item">
          <summary>
            <span className="faq-item__number">{String(index + 1).padStart(2, "0")}</span>
            <span>{item.question}</span>
            <span className="faq-item__toggle" aria-hidden="true">+</span>
          </summary>
          <div><p>{item.answer}</p></div>
        </details>
      ))}
    </div>
  );
}

export function InfoNotice({ title, children, tone = "sand" }: { title: string; children: ReactNode; tone?: "sand" | "green" | "dark" }) {
  return (
    <aside className={`info-notice info-notice--${tone}`}>
      <span className="info-notice__icon"><Icon name="shield" width={22} height={22} /></span>
      <div><strong>{title}</strong><p>{children}</p></div>
    </aside>
  );
}

export function NumberedSteps({
  items,
}: {
  items: readonly { number: string; title: string; description: string }[];
}) {
  return (
    <ol className="numbered-steps">
      {items.map((item) => (
        <li key={item.number}>
          <span>{item.number}</span>
          <div><h3>{item.title}</h3><p>{item.description}</p></div>
        </li>
      ))}
    </ol>
  );
}

export function MissionPanel() {
  return (
    <div className="mission-panel" aria-label="Schemat scenariusza rakiety V2">
      <div className="mission-panel__head">
        <span>SCENARIUSZ // V2</span>
        <span className="mission-panel__live"><i /> MISJA AKTYWNA</span>
      </div>
      <div className="mission-panel__body">
        <div className="rocket" aria-hidden="true">
          <Image src="/rakieta.jpg" alt="" width={1024} height={1536} />
        </div>
        <div className="mission-panel__timer">
          <small>CZAS DO FINAŁU</small>
          <strong>10:00</strong>
          <div><span /></div>
        </div>
      </div>
      <div className="mission-panel__foot">
        <span>01 · UTRZYMAJ PRZYCISK</span>
        <span>02 · BROŃ POZYCJI</span>
        <span>03 · ZATRZYMAJ ATAK</span>
      </div>
    </div>
  );
}
