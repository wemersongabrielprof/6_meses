"use client";

import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import type { Decree, GuestSnapshot } from "@/lib/types";
import { AlbumExperience } from "./AlbumExperience";
import { DictatorExperience } from "./DictatorExperience";
import { LoveBikeGame } from "./LoveBikeGame";
import { SectionBack } from "./SectionBack";

type Section = "home" | "album" | "dictator" | "game";

const cards = [
  { id: "album", icon: "📸", title: "Nosso Álbum", copy: "Sete lembranças, muitos sorrisos e um montão de carinho.", cta: "Abrir o álbum" },
  { id: "dictator", icon: "👑", title: "Yasmin Ditador", copy: "O palácio está aberto. Hoje, suas ordens viram decretos reais.", cta: "Assumir o palácio" },
  { id: "game", icon: "🚗", title: "HB20 do Médio", copy: "Acompanhe um CLT em busca da alegria da sua namorada.", cta: "Começar a missão" },
] as const;

export function SurpriseExperience({ token, anthemUrl }: { token: string; anthemUrl: string }) {
  const [section, setSection] = useState<Section>("home");
  const [snapshot, setSnapshot] = useState<GuestSnapshot>({ decrees: [], likeCounts: {} });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/invites/${encodeURIComponent(token)}/snapshot`, { cache: "no-store" });
      if (response.ok) setSnapshot((await response.json()) as GuestSnapshot);
    } catch {
      // O conteúdo continua utilizável; ações individuais mostrarão erros claros.
    }
  }, [token]);

  useEffect(() => {
    const firstRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(refresh, 8_000);
    const visitKey = `six-months-visit-${token.slice(-8)}`;
    if (!sessionStorage.getItem(visitKey)) {
      sessionStorage.setItem(visitKey, "1");
      void fetch(`/api/invites/${encodeURIComponent(token)}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "visit", idempotencyKey: crypto.randomUUID() }),
      });
    }
    return () => {
      window.clearTimeout(firstRefresh);
      window.clearInterval(timer);
    };
  }, [refresh, token]);

  const openSection = (next: Section) => {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addDecree = (decree: Decree) => {
    setSnapshot((current) => ({ ...current, decrees: [decree, ...current.decrees.filter((item) => item.id !== decree.id)] }));
  };

  const incrementLike = (photoId: number) => {
    setSnapshot((current) => ({
      ...current,
      likeCounts: { ...current.likeCounts, [photoId]: (current.likeCounts[photoId] ?? 0) + 1 },
    }));
  };

  return (
    <main className="surprise-shell">
      <div className="ambient-hearts" aria-hidden="true"><i>♥</i><i>♡</i><i>♥</i><i>♡</i></div>
      {section === "home" ? (
        <div className="home-experience page-enter">
          <header className="hero">
            <div className="hero-ornament" aria-hidden="true"><span>✦</span><b>6</b><span>✦</span></div>
            <p className="eyebrow">Nosso pequeno grande capítulo</p>
            <h1>{siteConfig.couple.headline}</h1>
            <p className="hero-copy">{siteConfig.couple.subtitle}</p>
            <div className="scroll-note" aria-hidden="true">três surpresas esperam por você <span>↓</span></div>
          </header>

          <section className="experience-grid" aria-label="Escolha uma surpresa">
            {cards.map((card, index) => (
              <button
                className={`experience-card card-${index + 1}`}
                type="button"
                onClick={() => openSection(card.id)}
                key={card.id}
              >
                <span className="card-number">0{index + 1}</span>
                <span className="card-icon" aria-hidden="true">{card.icon}</span>
                <span className="card-content">
                  <strong>{card.title}</strong>
                  <small>{card.copy}</small>
                  <em>{card.cta} <span aria-hidden="true">→</span></em>
                </span>
              </button>
            ))}
          </section>

          <p className="privacy-note">♡ Seus decretos, corações e pontuações serão enviados para seu namorado.</p>
          <footer className="romantic-footer">Feito para você, com amor e um pouquinho de código.</footer>
        </div>
      ) : (
        <div className="section-page page-enter">
          <SectionBack onBack={() => openSection("home")} />
          {section === "album" && (
            <AlbumExperience token={token} likeCounts={snapshot.likeCounts} onLike={incrementLike} onBack={() => openSection("home")} />
          )}
          {section === "dictator" && (
            <DictatorExperience token={token} anthemUrl={anthemUrl} decrees={snapshot.decrees} onCreated={addDecree} />
          )}
          {section === "game" && <LoveBikeGame token={token} />}
        </div>
      )}
    </main>
  );
}
