import Link from "next/link";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { mainNavigation } from "@/data/site";
import { formatBusinessAddress, type BusinessBundle } from "@/lib/business/model";

export function SiteFooter({ business }: { business: BusinessBundle }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__paint" aria-hidden="true" />
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo light />
          <p>
            Terenowa rozgrywka, mocne scenariusze i przestrzeń, w której drużyna naprawdę musi działać razem.
          </p>
          <div className="status-pill"><span /> Zapytania przyjmujemy online</div>
        </div>
        <div>
          <p className="footer-title">Odkrywaj</p>
          <ul className="footer-links">
            {mainNavigation.slice(0, 5).map((item) => (
              <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="footer-title">Przygotuj wizytę</p>
          <ul className="footer-links">
            <li><Link href="/zapytaj-o-termin">Zapytaj o termin</Link></li>
            <li><Link href="/dojazd">Dojazd</Link></li>
            <li><Link href="/faq">Najczęstsze pytania</Link></li>
            <li><Link href="/regulamin">Regulamin</Link></li>
          </ul>
        </div>
        <div className="site-footer__contact">
          <p className="footer-title">Kontakt</p>
          <p><Icon name="map" width={19} height={19} /> {formatBusinessAddress(business.profile)}</p>
          <p><Icon name="clock" width={19} height={19} /> {business.contact.hours}</p>
          {business.contact.phoneHref ? (
            <p><a href={business.contact.phoneHref}>{business.contact.phoneDisplay}</a></p>
          ) : null}
          <Link className="footer-route" href="/kontakt">Dane kontaktowe <Icon name="arrow" width={17} height={17} /></Link>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <p>© {new Date().getFullYear()} {business.profile.tradeName}</p>
        <p className="site-footer__notice">Zapytanie online nie jest potwierdzeniem terminu.</p>
        <div>
          <Link href="/polityka-prywatnosci">Prywatność</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/panel/logowanie">Logowanie</Link>
        </div>
      </div>
    </footer>
  );
}
