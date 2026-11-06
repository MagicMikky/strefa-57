"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { mainNavigation } from "@/data/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const open = menuState.open && menuState.pathname === pathname;

  useEffect(() => {
    document.body.dataset.menuOpen = open ? "true" : "false";
    return () => {
      delete document.body.dataset.menuOpen;
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <p><span aria-hidden="true" /> Terenowa rozgrywka pod Gdańskiem</p>
        <Link href="/dojazd">Żurawia 29, Czaple <Icon name="arrow" width={15} height={15} /></Link>
      </div>
      <div className="site-header__main container">
        <div className="site-header__brand">
          <Logo />
          <div className="coordinate-tag">
            <span>54°N</span>
            <span>18°E</span>
            <strong>STREFA 29</strong>
          </div>
        </div>
        <nav className="desktop-nav" aria-label="Główna nawigacja">
          {mainNavigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="button button--header" href="/zapytaj-o-termin">
          <span>Zapytaj o termin</span><Icon name="arrow" width={18} height={18} />
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setMenuState({ open: !open, pathname })}
        >
          <Icon name={open ? "close" : "menu"} width={24} height={24} />
        </button>
      </div>
      <div className={`mobile-menu${open ? " mobile-menu--open" : ""}`} id="mobile-menu">
        <nav aria-label="Nawigacja mobilna">
          {mainNavigation.map((item, index) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
              <span>0{index + 1}</span>{item.label}<Icon name="arrow" width={20} height={20} />
            </Link>
          ))}
          <Link className="mobile-menu__cta" href="/zapytaj-o-termin">
            Zapytaj o wolny termin <Icon name="arrow" width={20} height={20} />
          </Link>
        </nav>
        <p>Wysłanie formularza nie rezerwuje ani nie blokuje terminu.</p>
      </div>
    </header>
  );
}
