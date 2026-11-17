"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

export function AlbumExperience({
  token,
  likeCounts,
  onLike,
  onBack,
}: {
  token: string;
  likeCounts: Record<number, number>;
  onLike: (photoId: number) => void;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [savingLike, setSavingLike] = useState(false);
  const [message, setMessage] = useState("");
  const pointerStart = useRef<number | null>(null);
  const opened = useRef(new Set<number>());
  const photos = siteConfig.album;
  const photo = photos[index];

  const move = useCallback((direction: -1 | 1) => {
    setIndex((current) => Math.min(photos.length - 1, Math.max(0, current + direction)));
    setMessage("");
  }, [photos.length]);

  useEffect(() => {
    if (!opened.current.has(photo.id)) {
      opened.current.add(photo.id);
      void fetch(`/api/invites/${encodeURIComponent(token)}/album-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: photo.id, eventType: "opened", idempotencyKey: crypto.randomUUID() }),
      });
    }
    const next = photos[index + 1];
    if (next) {
      const image = new window.Image();
      image.src = next.src;
    }
  }, [index, photo.id, photos, token]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const saveHeart = async () => {
    setSavingLike(true);
    setMessage("");
    try {
      const response = await fetch(`/api/invites/${encodeURIComponent(token)}/album-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: photo.id, eventType: "liked", idempotencyKey: crypto.randomUUID() }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível guardar o coração.");
      onLike(photo.id);
      setMessage("Coração guardado! ❤️");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível guardar o coração.");
    } finally {
      setSavingLike(false);
    }
  };

  return (
    <section className="album-section" aria-labelledby="album-title">
      <header className="section-heading">
        <p className="eyebrow">Capítulo um</p>
        <h1 id="album-title">Nosso Álbum <span aria-hidden="true">📸</span></h1>
        <p>Deslize com carinho. Cada pedacinho daqui é nosso.</p>
      </header>

      <div className="album-layout">
        <div className="album-counter"><strong>{String(index + 1).padStart(2, "0")}</strong><span>de {photos.length}</span></div>
        <div
          className="photo-stage"
          onPointerDown={(event) => { pointerStart.current = event.clientX; }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const delta = event.clientX - pointerStart.current;
            if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
            pointerStart.current = null;
          }}
        >
          <button className="photo-button" type="button" onClick={() => setLightbox(true)} aria-label={`Ampliar ${photo.alt}`}>
            <Image
              key={photo.src}
              className="album-photo"
              src={photo.src}
              alt={photo.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 760px) 92vw, 620px"
            />
            <span className="zoom-hint" aria-hidden="true">↗ ampliar</span>
          </button>
          <button className="album-arrow arrow-left" type="button" onClick={() => move(-1)} disabled={index === 0} aria-label="Foto anterior">‹</button>
          <button className="album-arrow arrow-right" type="button" onClick={() => move(1)} disabled={index === photos.length - 1} aria-label="Próxima foto">›</button>
        </div>

        <div className="photo-story">
          <p className="photo-caption">“{photo.caption}”</p>
          <button className="heart-button" type="button" onClick={saveHeart} disabled={savingLike}>
            <span className={message.startsWith("Coração") ? "heart-pop" : ""} aria-hidden="true">♥</span>
            {savingLike ? "Guardando…" : "Dar um coração"}
            <b>{likeCounts[photo.id] ?? 0}</b>
          </button>
          <p className="inline-feedback" role="status">{message}</p>
        </div>
      </div>

      <div className="album-timeline" aria-label="Escolher fotografia">
        {photos.map((item, itemIndex) => (
          <button
            type="button"
            className={itemIndex === index ? "active" : ""}
            onClick={() => setIndex(itemIndex)}
            aria-label={`Abrir foto ${itemIndex + 1}`}
            aria-current={itemIndex === index ? "true" : undefined}
            key={item.id}
          >
            <Image src={item.src} alt="" fill sizes="64px" />
            <span>{itemIndex + 1}</span>
          </button>
        ))}
      </div>

      {index === photos.length - 1 && (
        <div className="album-ending page-enter">
          <span aria-hidden="true">♥</span>
          <p>{siteConfig.couple.closing}</p>
          <button className="primary-button" type="button" onClick={onBack}>Voltar para as surpresas</button>
        </div>
      )}

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Fotografia ampliada" onClick={() => setLightbox(false)}>
          <button type="button" onClick={() => setLightbox(false)} aria-label="Fechar fotografia ampliada">×</button>
          <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={photo.src} alt={photo.alt} fill sizes="96vw" priority />
          </div>
        </div>
      )}
    </section>
  );
}
