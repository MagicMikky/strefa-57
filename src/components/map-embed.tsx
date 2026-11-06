"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { trackEvent } from "@/lib/consent";

const fallbackQuery = "Żurawia 29, 80-298 Czaple";

export function MapEmbed() {
  const [active, setActive] = useState(false);
  const query = process.env.NEXT_PUBLIC_MAP_QUERY || fallbackQuery;
  const encoded = encodeURIComponent(query);

  if (!active) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder__grid" aria-hidden="true" />
        <span className="map-placeholder__pin"><Icon name="map" width={30} height={30} /></span>
        <div>
          <p className="eyebrow">Mapa zewnętrzna</p>
          <h2>Uruchom mapę, gdy jej potrzebujesz.</h2>
          <p>Mapa Google nie jest ładowana automatycznie. Po kliknięciu połączysz się z usługą zewnętrzną.</p>
          <button className="button button--primary" type="button" onClick={() => setActive(true)}>
            Pokaż mapę <Icon name="map" width={18} height={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-frame">
      <iframe
        title="Mapa dojazdu do Paintball Strefa 29"
        src={`https://www.google.com/maps?q=${encoded}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("directions_click", { source: "map" })}
      >
        Otwórz trasę w Google Maps <Icon name="arrow" width={17} height={17} />
      </a>
    </div>
  );
}
