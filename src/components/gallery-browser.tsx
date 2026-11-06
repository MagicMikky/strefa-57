"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { GalleryPhoto } from "@/data/gallery";

export function GalleryBrowser({ photos }: { photos: readonly GalleryPhoto[] }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const titleId = useId();
  const current = active === null ? null : photos[active];

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((direction: number) => {
    setActive((index) => {
      if (index === null) return index;
      return (index + direction + photos.length) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, close, step]);

  return (
    <>
      <div className="gallery-grid gallery-grid--photos">
        {photos.map((photo, index) => (
          <article className={`gallery-card gallery-card--photo${index === 0 ? " gallery-card--feature" : ""}`} key={photo.src}>
            <button className="gallery-card__open" type="button" onClick={() => setActive(index)}>
              <span className="gallery-card__art">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes={index === 0 ? "(max-width: 760px) 100vw, 66vw" : "(max-width: 760px) 100vw, 33vw"}
                />
              </span>
              <span className="gallery-card__caption">
                <span><strong>{photo.title}</strong><small>{photo.label}</small></span>
                <span>Powiększ</span>
              </span>
            </button>
          </article>
        ))}
      </div>

      {current ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onPointerDown={(event) => {
            touchStart.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (touchStart.current === null) return;
            const delta = event.clientX - touchStart.current;
            touchStart.current = null;
            if (Math.abs(delta) < 48) return;
            step(delta < 0 ? 1 : -1);
          }}
        >
          <button className="lightbox__close" type="button" ref={closeRef} onClick={close}>Zamknij</button>
          <button className="lightbox__nav lightbox__nav--prev" type="button" onClick={() => step(-1)} aria-label="Poprzednie zdjęcie">‹</button>
          <figure>
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="100vw"
              priority
            />
            <figcaption id={titleId}>{current.title}. {current.label}</figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" type="button" onClick={() => step(1)} aria-label="Następne zdjęcie">›</button>
        </div>
      ) : null}
    </>
  );
}
