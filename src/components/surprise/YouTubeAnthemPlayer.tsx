"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildYouTubeEmbedUrl, buildYouTubeWatchUrl, parseYouTubeVideoId } from "@/lib/youtube";

type YouTubePlayer = {
  destroy: () => void;
};

type YouTubePlayerEvent = {
  target: YouTubePlayer;
};

type YouTubePlayerErrorEvent = YouTubePlayerEvent & {
  data: number;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events: {
        onError: (event: YouTubePlayerErrorEvent) => void;
        onReady: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  const loading = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error("O player demorou demais para responder.")), 12_000);

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      window.clearTimeout(timeout);
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("A API do player não ficou disponível."));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (existing) {
      existing.addEventListener("error", () => reject(new Error("Não foi possível carregar o player.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => reject(new Error("Não foi possível carregar o player.")), { once: true });
    document.head.appendChild(script);
  });

  youtubeApiPromise = loading.catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
  });
  return youtubeApiPromise;
}

function playbackErrorMessage(errorCode: number | null) {
  if (errorCode === 153) return "O YouTube não conseguiu identificar a origem do player.";
  if (errorCode === 101 || errorCode === 150) {
    return "O canal não permite reproduzir este vídeo fora do YouTube. A música continua disponível no canal oficial.";
  }
  if (errorCode === 100) return "Este vídeo não está mais disponível para reprodução incorporada.";
  return "Às vezes o YouTube limita a reprodução incorporada. A música continua disponível no canal oficial.";
}

export function YouTubeAnthemPlayer({ anthemUrl, origin }: { anthemUrl: string; origin: string }) {
  const videoId = useMemo(() => parseYouTubeVideoId(anthemUrl), [anthemUrl]);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(videoId ? "loading" : "error");
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const watchUrl = buildYouTubeWatchUrl(videoId ?? "");

  useEffect(() => {
    if (!videoId || !iframeRef.current) return;
    let active = true;
    const readyTimeout = window.setTimeout(() => {
      if (active) setStatus("error");
    }, 15_000);

    void loadYouTubeIframeApi()
      .then((youtube) => {
        if (!active || !iframeRef.current) return;
        playerRef.current = new youtube.Player(iframeRef.current, {
          events: {
            onReady: () => {
              if (!active) return;
              window.clearTimeout(readyTimeout);
              setStatus("ready");
            },
            onError: (event) => {
              if (!active) return;
              window.clearTimeout(readyTimeout);
              setErrorCode(event.data);
              setStatus("error");
            },
          },
        });
      })
      .catch(() => {
        if (!active) return;
        window.clearTimeout(readyTimeout);
        setStatus("error");
      });

    return () => {
      active = false;
      window.clearTimeout(readyTimeout);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [attempt, videoId]);

  const retry = () => {
    setErrorCode(null);
    setStatus("loading");
    setAttempt((current) => current + 1);
  };

  if (!videoId || status === "error") {
    return (
      <div className="anthem-fallback page-enter" role="status">
        <span aria-hidden="true">♫</span>
        <strong>{videoId ? "O hino não abriu dentro do palácio." : "A URL do hino precisa ser corrigida."}</strong>
        <p>{playbackErrorMessage(errorCode)}</p>
        <a className="anthem-youtube-link" href={watchUrl} target="_blank" rel="noopener noreferrer">
          Abrir música no YouTube <span aria-hidden="true">↗</span>
        </a>
        {videoId && <button type="button" onClick={retry}>Tentar o player novamente</button>}
      </div>
    );
  }

  return (
    <div className="anthem-player page-enter">
      <div className="anthem-frame">
        <iframe
          key={attempt}
          ref={iframeRef}
          src={buildYouTubeEmbedUrl(videoId, origin)}
          title="Hino da Yasmin Ditador no YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
        {status === "loading" && (
          <div className="anthem-loading" role="status">
            <span aria-hidden="true">♛</span>
            <p>A orquestra real está afinando…</p>
          </div>
        )}
      </div>
      <a className="anthem-youtube-link" href={watchUrl} target="_blank" rel="noopener noreferrer">
        Abrir música no YouTube <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
