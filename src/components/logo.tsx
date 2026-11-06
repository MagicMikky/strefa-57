import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`logo${light ? " logo--light" : ""}`} href="/">
      <Image
        src="/logo.png"
        alt="Paintball Strefa 29"
        width={900}
        height={900}
        sizes="(max-width: 720px) 46vw, 280px"
        priority={!light}
      />
    </Link>
  );
}
