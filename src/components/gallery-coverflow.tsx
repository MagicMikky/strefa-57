"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  categoriesWithPhotos,
  type GalleryCategoryId,
  type GalleryPhoto,
} from "@/data/gallery";

const SWIPE_DISTANCE = 48;

function placeFor(offset: number): "center" | "side" | "edge" | "hidden" {
  const distance = Math.abs(offset);
  if (distance === 0) return "center";
  if (distance === 1) return "side";
  if (distance === 2) return "edge";
  return "hidden";
}

export function GalleryCoverflow({
  photos,
  empty = false,
}: {
  photos: readonly GalleryPhoto[];
  empty?: boolean;
}) {
  const categories = categoriesWithPhotos(photos);
  const [category, setCategory] = useState<GalleryCategoryId | "pusta">(empty ? "pusta" : "wszystkie");
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const titleId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const swipeRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const ignoreClickRef = useRef(false);

  const visible = category === "pusta"
    ? []
    : category === "wszystkie"
      ? photos
      : photos.filter((photo) => photo.category === category);
  const activeIndex = visible.length === 0 ? 0 : Math.min(index, visible.length - 1);
  const active = visible[activeIndex] ?? null;
  const activeCategory = categories.find((item) => item.id === category);

  const selectCategory = (next: GalleryCategoryId) => {
    setCategory(next);
    setIndex(0);
    setLightboxOpen(false);
  };

  const move = (direction: number) => {
    setIndex((current) => {
      const last = visible.length - 1;
      if (last < 0) return 0;
      return Math.min(last, Math.max(0, current + direction));
    });
  };

  const openLightbox = (opener: HTMLButtonElement | null) => {
    openerRef.current = opener;
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    openerRef.current?.focus();
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const length = visible.length;
    closeRef.current?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightboxOpen(false);
        openerRef.current?.focus();
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const direction = event.key === "ArrowRight" ? 1 : -1;
        setIndex((current) => Math.min(Math.max(length - 1, 0), Math.max(0, current + direction)));
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled)")];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, visible.length]);

  const onCategoryKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = Math.max(0, categories.findIndex((item) => item.id === category));
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = categories[current + delta];
    if (!next) return;
    selectCategory(next.id);
    requestAnimationFrame(() => document.getElementById(`gallery-tab-${next.id}`)?.focus());
  };

  const lightboxPhoto = lightboxOpen ? active : null;

  return (
    <section className="coverflow" aria-labelledby="gallery-coverflow-title">
      <h2 id="gallery-coverflow-title" className="sr-only">Rolka zdjęć pola</h2>
      <div
        className="coverflow__filters"
        role="tablist"
        aria-label="Kategorie zdjęć"
        onKeyDown={onCategoryKey}
      >
        {categories.map((item) => {
          const selected = item.id === category;
          return (
            <button
              key={item.id}
              id={`gallery-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="gallery-coverflow-panel"
              tabIndex={selected || (category === "pusta" && item.id === "wszystkie") ? 0 : -1}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <p className="coverflow__filter-status">
        {category === "pusta"
          ? "Wybrano kategorię bez zdjęć."
          : `Aktywny filtr: ${activeCategory?.label ?? "Wszystkie"}.`}
      </p>

      {visible.length === 0 || !active ? (
        <p className="coverflow__empty" role="status">W tej kategorii nie ma jeszcze zdjęć.</p>
      ) : (
        <div className="coverflow__panel" id="gallery-coverflow-panel" role="tabpanel" aria-labelledby={`gallery-tab-${category}`}>
          <div className="coverflow__stage">
            <div
              className="coverflow__viewport"
              data-testid="gallery-coverflow"
              tabIndex={0}
              role="group"
              aria-roledescription="karuzela"
              aria-label="Zdjęcia wybranej kategorii"
              ref={viewportRef}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  move(1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  move(-1);
                }
              }}
              onPointerDown={(event) => {
                if (event.button > 0) return;
                const startX = event.clientX;
                const startY = event.clientY;
                const onUp = (up: PointerEvent) => {
                  window.removeEventListener("pointerup", onUp);
                  const deltaX = up.clientX - startX;
                  const deltaY = up.clientY - startY;
                  if (Math.abs(deltaX) < SWIPE_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY)) return;
                  ignoreClickRef.current = true;
                  move(deltaX < 0 ? 1 : -1);
                };
                window.addEventListener("pointerup", onUp);
              }}
              onClickCapture={(event) => {
                if (!ignoreClickRef.current) return;
                event.preventDefault();
                event.stopPropagation();
                ignoreClickRef.current = false;
              }}
            >
              {visible.map((photo, photoIndex) => {
                const offset = photoIndex - activeIndex;
                const place = placeFor(offset);
                if (place === "hidden") return null;
                const failedPhoto = failed.has(photo.src);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className="coverflow__slide"
                    data-offset={offset}
                    data-place={place}
                    data-side={offset < 0 ? "left" : offset > 0 ? "right" : "center"}
                    aria-current={offset === 0 ? "true" : undefined}
                    aria-label={offset === 0 ? `Powiększ zdjęcie: ${photo.title}` : `Pokaż na środku: ${photo.title}`}
                    onClick={(event) => {
                      if (offset === 0) openLightbox(event.currentTarget);
                      else setIndex(photoIndex);
                    }}
                  >
                    <span className="coverflow__frame">
                      {failedPhoto ? (
                        <span className="coverflow__missing" role="img" aria-label={photo.alt}>
                          Nie udało się wczytać tego zdjęcia.
                        </span>
                      ) : (
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          width={photo.width}
                          height={photo.height}
                          sizes={offset === 0 ? "(max-width: 760px) 78vw, 440px" : "(max-width: 760px) 28vw, 240px"}
                          priority={offset === 0}
                          onError={() => setFailed((current) => new Set(current).add(photo.src))}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="coverflow__meta">
            <button
              className="coverflow__nav"
              type="button"
              aria-label="Poprzednie zdjęcie"
              disabled={activeIndex === 0}
              onClick={() => move(-1)}
            >
              ‹
            </button>
            <p aria-live="polite">
              <strong>{active.title}</strong>
              <span>{active.label}</span>
              <span className="coverflow__count">{activeIndex + 1} z {visible.length}</span>
            </p>
            <button
              className="coverflow__nav"
              type="button"
              aria-label="Następne zdjęcie"
              disabled={activeIndex === visible.length - 1}
              onClick={() => move(1)}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {lightboxPhoto ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          ref={dialogRef}
          onPointerDown={(event) => {
            swipeRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
          }}
          onPointerUp={(event) => {
            const start = swipeRef.current;
            swipeRef.current = null;
            if (!start || start.pointerId !== event.pointerId) return;
            const deltaX = event.clientX - start.x;
            if (Math.abs(deltaX) < SWIPE_DISTANCE) return;
            move(deltaX < 0 ? 1 : -1);
          }}
        >
          <button className="lightbox__close" type="button" ref={closeRef} onClick={closeLightbox}>Zamknij</button>
          <button className="lightbox__nav lightbox__nav--prev" type="button" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label="Poprzednie zdjęcie">‹</button>
          <figure>
            <Image
              src={lightboxPhoto.src}
              alt={lightboxPhoto.alt}
              width={lightboxPhoto.width}
              height={lightboxPhoto.height}
              sizes="92vw"
              priority
            />
            <figcaption id={titleId}>
              {lightboxPhoto.title}. {lightboxPhoto.label}. {activeIndex + 1} z {visible.length}
            </figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" type="button" onClick={() => move(1)} disabled={activeIndex === visible.length - 1} aria-label="Następne zdjęcie">›</button>
        </div>
      ) : null}
    </section>
  );
}
