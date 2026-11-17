"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig, type GameItemKey } from "@/config/site";
import { calculateScore, collectedAllCategories, type GameCounts } from "@/lib/game";
import type { GameRunPayload } from "@/lib/schemas";

type Phase = "intro" | "playing" | "paused" | "ended";
type Entity =
  | { type: "item"; item: GameItemKey; x: number; y: number; w: number; h: number }
  | { type: "obstacle"; obstacle: "cone" | "puddle"; x: number; y: number; w: number; h: number };
type Particle = { x: number; y: number; life: number; text: string; vx: number; vy: number };
type Hud = { lives: number; score: number; time: number; counts: GameCounts };
type Runtime = {
  phase: Phase;
  elapsed: number;
  playerY: number;
  velocityY: number;
  lives: number;
  counts: GameCounts;
  score: number;
  entities: Entity[];
  particles: Particle[];
  itemTimer: number;
  obstacleTimer: number;
  invincible: number;
  background: number;
  itemCursor: number;
  hudTimer: number;
};

const WIDTH = 960;
const HEIGHT = 540;
const GROUND = 438;
const itemOrder: GameItemKey[] = ["cake", "collar", "bag", "zara"];

const emptyCounts = (): GameCounts => ({ cake: 0, collar: 0, bag: 0, zara: 0 });

const freshRuntime = (): Runtime => ({
  phase: "intro",
  elapsed: 0,
  playerY: GROUND,
  velocityY: 0,
  lives: 3,
  counts: emptyCounts(),
  score: 0,
  entities: [],
  particles: [],
  itemTimer: 0,
  obstacleTimer: 2.5,
  invincible: 0,
  background: 0,
  itemCursor: 0,
  hudTimer: 0,
});

function intersects(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function LoveBikeGame({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceRef = useRef<HTMLImageElement | null>(null);
  const runtime = useRef<Runtime>(freshRuntime());
  const [phase, setPhase] = useState<Phase>("intro");
  const [hud, setHud] = useState<Hud>({ lives: 3, score: 0, time: siteConfig.game.durationSeconds, counts: emptyCounts() });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [lastResult, setLastResult] = useState<GameRunPayload | null>(null);

  const saveRun = useCallback(async (payload: GameRunPayload) => {
    setSaveStatus("saving");
    setSaveMessage("Guardando sua pontuação no palácio…");
    try {
      const response = await fetch(`/api/invites/${encodeURIComponent(token)}/game-runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível salvar a partida.");
      localStorage.removeItem("yasmin-pending-game-run");
      setSaveStatus("saved");
      setSaveMessage("Pontuação salva de verdade! Ela já está no painel. ✓");
    } catch (error) {
      localStorage.setItem("yasmin-pending-game-run", JSON.stringify(payload));
      setSaveStatus("error");
      setSaveMessage(error instanceof Error ? error.message : "Não foi possível salvar a partida.");
    }
  }, [token]);

  const finish = useCallback((game: Runtime) => {
    if (game.phase === "ended") return;
    game.phase = "ended";
    const attemptsKey = `yasmin-game-attempts-${token.slice(-8)}`;
    const attempts = Math.max(1, Number(sessionStorage.getItem(attemptsKey) || "1"));
    const payload: GameRunPayload = {
      clientRunId: crypto.randomUUID(),
      score: calculateScore(game.counts),
      durationSeconds: Math.max(1, Math.round(game.elapsed)),
      items: { ...game.counts },
      won: collectedAllCategories(game.counts),
      attempts,
    };
    setHud({
      lives: game.lives,
      score: payload.score,
      time: Math.max(0, Math.ceil(siteConfig.game.durationSeconds - game.elapsed)),
      counts: { ...game.counts },
    });
    setLastResult(payload);
    setPhase("ended");
    void saveRun(payload);
  }, [saveRun, token]);

  const jump = useCallback(() => {
    const game = runtime.current;
    if (game.phase === "playing" && game.playerY >= GROUND - 2) game.velocityY = -710;
  }, []);

  const startGame = () => {
    const attemptsKey = `yasmin-game-attempts-${token.slice(-8)}`;
    const attempts = Number(sessionStorage.getItem(attemptsKey) || "0") + 1;
    sessionStorage.setItem(attemptsKey, String(attempts));
    const game = freshRuntime();
    game.phase = "playing";
    runtime.current = game;
    setHud({ lives: 3, score: 0, time: siteConfig.game.durationSeconds, counts: emptyCounts() });
    setSaveStatus("idle");
    setSaveMessage("");
    setLastResult(null);
    setPhase("playing");
  };

  const togglePause = useCallback(() => {
    const game = runtime.current;
    if (game.phase === "playing") {
      game.phase = "paused";
      setPhase("paused");
    } else if (game.phase === "paused") {
      game.phase = "playing";
      setPhase("playing");
    }
  }, []);

  useEffect(() => {
    const face = new Image();
    face.src = "/assets/avatar-rosto.webp";
    faceRef.current = face;

    const keyDown = (event: KeyboardEvent) => {
      if (["Space", "ArrowUp"].includes(event.code)) {
        event.preventDefault();
        jump();
      }
      if (event.code === "KeyP" || event.code === "Escape") togglePause();
    };
    const visibility = () => {
      if (document.hidden && runtime.current.phase === "playing") {
        runtime.current.phase = "paused";
        setPhase("paused");
      }
    };
    window.addEventListener("keydown", keyDown);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("keydown", keyDown);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [jump, togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let last = performance.now();

    const drawScene = (game: Runtime) => {
      const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, "#f7d8d4");
      sky.addColorStop(0.58, "#fff3dd");
      sky.addColorStop(1, "#dbe6c3");
      context.fillStyle = sky;
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.fillStyle = "rgba(255, 214, 116, .65)";
      context.beginPath();
      context.arc(790, 82, 47, 0, Math.PI * 2);
      context.fill();

      const cloudOffset = -(game.background * 0.08) % 1100;
      context.fillStyle = "rgba(255,255,255,.72)";
      for (let i = 0; i < 4; i += 1) {
        const x = cloudOffset + i * 330;
        context.beginPath();
        context.ellipse(x, 90 + (i % 2) * 45, 68, 18, 0, 0, Math.PI * 2);
        context.ellipse(x + 35, 76 + (i % 2) * 45, 42, 26, 0, 0, Math.PI * 2);
        context.fill();
      }

      const hillOffset = -(game.background * 0.18) % 420;
      context.fillStyle = "#a9b984";
      for (let i = -1; i < 4; i += 1) {
        context.beginPath();
        context.arc(hillOffset + i * 420, 410, 290, Math.PI, 0);
        context.fill();
      }
      context.fillStyle = "#6e8c62";
      for (let i = 0; i < 12; i += 1) {
        const x = ((i * 130 - game.background * 0.35) % 1100) - 60;
        context.fillRect(x, 320 + (i % 3) * 18, 12, 95);
        context.beginPath();
        context.arc(x + 6, 305 + (i % 3) * 18, 35, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "#d3b77a";
      context.fillRect(0, GROUND + 28, WIDTH, HEIGHT - GROUND);
      context.fillStyle = "#f7e6b9";
      context.fillRect(0, GROUND + 6, WIDTH, 24);
      context.strokeStyle = "rgba(112,31,56,.25)";
      context.lineWidth = 3;
      for (let x = -(game.background % 80); x < WIDTH; x += 80) {
        context.beginPath();
        context.moveTo(x, GROUND + 49);
        context.lineTo(x + 35, GROUND + 49);
        context.stroke();
      }
    };

    const drawPlayer = (game: Runtime) => {
      const y = game.playerY;
      const blink = game.invincible > 0 && Math.floor(game.invincible * 12) % 2 === 0;
      if (blink) context.globalAlpha = 0.35;
      const wheelSpin = game.background / 24;
      context.strokeStyle = "#2a2626";
      context.lineWidth = 7;
      for (const wheelX of [142, 242]) {
        context.beginPath(); context.arc(wheelX, y - 8, 35, 0, Math.PI * 2); context.stroke();
        context.lineWidth = 2;
        for (let spoke = 0; spoke < 8; spoke += 1) {
          const angle = wheelSpin + spoke * Math.PI / 4;
          context.beginPath(); context.moveTo(wheelX, y - 8); context.lineTo(wheelX + Math.cos(angle) * 32, y - 8 + Math.sin(angle) * 32); context.stroke();
        }
        context.lineWidth = 7;
      }
      context.strokeStyle = "#8f2648";
      context.lineWidth = 8;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(142, y - 8); context.lineTo(178, y - 53); context.lineTo(212, y - 8); context.lineTo(154, y - 8); context.lineTo(196, y - 57); context.lineTo(242, y - 8); context.stroke();
      context.strokeStyle = "#cf9f45";
      context.beginPath(); context.moveTo(196, y - 57); context.lineTo(220, y - 78); context.lineTo(238, y - 76); context.stroke();

      const pedal = game.background / 18;
      context.strokeStyle = "#453130";
      context.lineWidth = 11;
      context.beginPath(); context.moveTo(184, y - 75); context.lineTo(180 + Math.cos(pedal) * 26, y - 34 + Math.sin(pedal) * 14); context.stroke();
      context.beginPath(); context.moveTo(206, y - 73); context.lineTo(206 - Math.cos(pedal) * 26, y - 34 - Math.sin(pedal) * 14); context.stroke();
      context.fillStyle = "#f4e4c2";
      context.beginPath(); context.roundRect(165, y - 139, 60, 73, 18); context.fill();
      context.fillStyle = "#7a263f";
      context.beginPath(); context.roundRect(160, y - 119, 70, 53, 15); context.fill();
      context.strokeStyle = "#f4e4c2";
      context.lineWidth = 12;
      context.beginPath(); context.moveTo(215, y - 105); context.lineTo(226, y - 77); context.stroke();

      context.save();
      context.beginPath();
      context.arc(188, y - 172, 58, 0, Math.PI * 2);
      context.clip();
      if (faceRef.current?.complete) context.drawImage(faceRef.current, 128, y - 232, 120, 120);
      else { context.fillStyle = "#e8b18d"; context.fillRect(128, y - 232, 120, 120); }
      context.restore();
      context.strokeStyle = "#f7ead0";
      context.lineWidth = 6;
      context.beginPath(); context.arc(188, y - 172, 60, 0, Math.PI * 2); context.stroke();
      context.globalAlpha = 1;
    };

    const drawEntities = (game: Runtime) => {
      context.textAlign = "center";
      for (const entity of game.entities) {
        if (entity.type === "item") {
          const item = siteConfig.game.items[entity.item];
          context.fillStyle = "rgba(255,255,255,.9)";
          context.beginPath(); context.roundRect(entity.x - 8, entity.y - 8, entity.w + 16, entity.h + 25, 18); context.fill();
          context.font = "38px system-ui";
          context.fillText(item.emoji, entity.x + entity.w / 2, entity.y + 35);
          context.font = "700 13px system-ui";
          context.fillStyle = "#701f38";
          context.fillText(entity.item === "zara" ? "Zara" : `+${item.points}`, entity.x + entity.w / 2, entity.y + 59);
        } else if (entity.obstacle === "cone") {
          context.fillStyle = "#dc6e35";
          context.beginPath(); context.moveTo(entity.x + entity.w / 2, entity.y); context.lineTo(entity.x + entity.w, entity.y + entity.h); context.lineTo(entity.x, entity.y + entity.h); context.closePath(); context.fill();
          context.fillStyle = "white"; context.fillRect(entity.x + 10, entity.y + 27, entity.w - 20, 7);
        } else {
          context.fillStyle = "#6796a5";
          context.beginPath(); context.ellipse(entity.x + entity.w / 2, entity.y + entity.h / 2, entity.w / 2, entity.h / 2, 0, 0, Math.PI * 2); context.fill();
        }
      }
      for (const particle of game.particles) {
        context.globalAlpha = Math.max(0, particle.life);
        context.font = "24px system-ui";
        context.fillText(particle.text, particle.x, particle.y);
      }
      context.globalAlpha = 1;
      context.textAlign = "left";
    };

    const update = (game: Runtime, delta: number) => {
      game.elapsed += delta;
      game.background += 250 * delta;
      game.invincible = Math.max(0, game.invincible - delta);
      game.velocityY += 1780 * delta;
      game.playerY += game.velocityY * delta;
      if (game.playerY >= GROUND) { game.playerY = GROUND; game.velocityY = 0; }

      game.itemTimer -= delta;
      game.obstacleTimer -= delta;
      if (game.itemTimer <= 0) {
        const item = itemOrder[game.itemCursor % itemOrder.length];
        game.itemCursor += 1;
        const yOptions = [292, 340, 386];
        const y = yOptions[Math.floor(Math.random() * yOptions.length)];
        game.entities.push({ type: "item", item, x: WIDTH + 20, y, w: 58, h: 58 });
        game.itemTimer = 0.82 + Math.random() * 0.42;
      }
      if (game.obstacleTimer <= 0) {
        const obstacle = Math.random() > 0.5 ? "cone" : "puddle";
        game.entities.push({ type: "obstacle", obstacle, x: WIDTH + 50, y: obstacle === "cone" ? GROUND - 45 : GROUND - 9, w: obstacle === "cone" ? 43 : 80, h: obstacle === "cone" ? 45 : 18 });
        game.obstacleTimer = 3.7 + Math.random() * 1.9;
      }

      const playerRect = { x: 126, y: game.playerY - 210, w: 118, h: 203 };
      const remaining: Entity[] = [];
      for (const entity of game.entities) {
        entity.x -= 295 * delta;
        const hitBox = entity.type === "item"
          ? { x: entity.x, y: entity.y, w: entity.w, h: entity.h }
          : { x: entity.x, y: entity.y, w: entity.w, h: entity.h };
        if (intersects(playerRect, hitBox)) {
          if (entity.type === "item") {
            game.counts[entity.item] += 1;
            game.score = calculateScore(game.counts);
            for (let i = 0; i < 5; i += 1) game.particles.push({ x: entity.x + 25, y: entity.y + 20, life: 1, text: i % 2 ? "♥" : `+${siteConfig.game.items[entity.item].points}`, vx: (Math.random() - 0.5) * 80, vy: -50 - Math.random() * 60 });
          } else if (game.invincible <= 0) {
            game.lives -= 1;
            game.invincible = 1.4;
            game.particles.push({ x: 185, y: game.playerY - 130, life: 1, text: "ai!", vx: 0, vy: -80 });
          }
          continue;
        }
        if (entity.x > -120) remaining.push(entity);
      }
      game.entities = remaining;
      game.particles = game.particles
        .map((particle) => ({ ...particle, x: particle.x + particle.vx * delta, y: particle.y + particle.vy * delta, life: particle.life - delta * 1.3 }))
        .filter((particle) => particle.life > 0);

      game.hudTimer -= delta;
      if (game.hudTimer <= 0) {
        setHud({ lives: game.lives, score: game.score, time: Math.max(0, Math.ceil(siteConfig.game.durationSeconds - game.elapsed)), counts: { ...game.counts } });
        game.hudTimer = 0.1;
      }
      if (game.elapsed >= siteConfig.game.durationSeconds || game.lives <= 0) finish(game);
    };

    const loop = (now: number) => {
      const delta = Math.min(0.034, (now - last) / 1000);
      last = now;
      const game = runtime.current;
      if (game.phase === "playing") update(game, delta);
      drawScene(game);
      drawEntities(game);
      drawPlayer(game);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [finish]);

  const retryPending = () => {
    if (lastResult) void saveRun(lastResult);
  };

  const allCollected = collectedAllCategories(hud.counts);

  return (
    <section className="game-section" aria-labelledby="game-title">
      <header className="section-heading game-heading">
        <p className="eyebrow">Capítulo três</p>
        <h1 id="game-title">Pedal do Amor <span aria-hidden="true">🚲</span></h1>
        <p>Pedale automaticamente, pule os obstáculos e colete tudo que a Yasmin ama.</p>
      </header>

      <div className="game-card">
        <div className="game-hud" aria-live="polite">
          <span><small>pontos</small><b>{hud.score}</b></span>
          <span><small>tempo</small><b>{hud.time}s</b></span>
          <span><small>vidas</small><b aria-label={`${hud.lives} vidas`}>{"♥".repeat(hud.lives)}{"♡".repeat(3 - hud.lives)}</b></span>
          <button type="button" onClick={togglePause} disabled={phase === "intro" || phase === "ended"}>{phase === "paused" ? "▶" : "Ⅱ"}</button>
        </div>
        <div className="canvas-wrap" onPointerDown={(event) => { if ((event.target as HTMLElement).tagName === "CANVAS") jump(); }}>
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Jogo de bicicleta Pedal do Amor" />

          {phase === "intro" && (
            <div className="game-overlay intro-overlay">
              <span className="bike-badge" aria-hidden="true">🚲</span>
              <p className="eyebrow">Missão do dia</p>
              <h2>Encha a cestinha de coisas boas!</h2>
              <p>Você tem {siteConfig.game.durationSeconds} segundos e 3 vidas. Colete pelo menos um item de cada tipo para completar a meta especial.</p>
              <div className="points-list">
                {itemOrder.map((key) => <span key={key}>{siteConfig.game.items[key].emoji} {siteConfig.game.items[key].label} <b>+{siteConfig.game.items[key].points}</b></span>)}
              </div>
              <p className="game-controls"><kbd>Espaço</kbd> ou <kbd>↑</kbd> no computador · toque ou botão no celular</p>
              <button className="game-start" type="button" onClick={startGame}>Começar o pedal <span aria-hidden="true">→</span></button>
            </div>
          )}

          {phase === "paused" && (
            <div className="game-overlay compact-overlay">
              <span aria-hidden="true">⏸</span><h2>Pausa para respirar</h2><p>O relógio parou. Volte quando quiser.</p>
              <button className="game-start" type="button" onClick={togglePause}>Continuar</button>
            </div>
          )}

          {phase === "ended" && (
            <div className="game-overlay result-overlay">
              <span className="result-heart" aria-hidden="true">♥</span>
              <p className="eyebrow">Partida concluída</p>
              <h2>Parabéns, Yasmin! Você conquistou meu coração de novo! ❤️</h2>
              <strong className="final-score">{hud.score} <small>pontos</small></strong>
              <p>{allCollected ? "Meta especial completa: um mimo de cada categoria! ✨" : "Quase lá! Jogue de novo para encontrar as quatro categorias."}</p>
              <div className="result-items">{itemOrder.map((key) => <span key={key}>{siteConfig.game.items[key].emoji} × {hud.counts[key]}</span>)}</div>
              <p className={`save-state ${saveStatus}`} role="status">{saveMessage}</p>
              {saveStatus === "error" && <button className="secondary-button" type="button" onClick={retryPending}>Tentar salvar novamente</button>}
              <button className="game-start" type="button" onClick={startGame}>Jogar novamente</button>
            </div>
          )}
        </div>
        <div className="mobile-game-bar">
          <div>{itemOrder.map((key) => <span key={key}>{siteConfig.game.items[key].emoji}<b>{hud.counts[key]}</b></span>)}</div>
          <button type="button" onClick={jump} disabled={phase !== "playing"}>Pular <span aria-hidden="true">↑</span></button>
        </div>
      </div>
      <p className="game-disclaimer">A partida pausa automaticamente se você trocar de aba. Resultado só aparece como salvo após confirmação do servidor.</p>
    </section>
  );
}
