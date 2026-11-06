import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`logo${light ? " logo--light" : ""}`} href="/" aria-label="Paintball Strefa 29 — strona główna">
      <span className="logo__mark" aria-hidden="true">29</span>
      <span className="logo__words">
        <strong>STREFA</strong>
        <small>PAINTBALL · CZAPLE</small>
      </span>
    </Link>
  );
}
