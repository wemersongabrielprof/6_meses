"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import type { Decree, DecreeStatus } from "@/lib/types";

const statusLabels: Record<DecreeStatus, string> = {
  recebido: "Recebido no palácio",
  em_andamento: "Em andamento",
  cumprido: "Cumprido com honra",
};

function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    return parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop() || "Gt2gf6NCr3Q";
  } catch {
    return "Gt2gf6NCr3Q";
  }
}

function localDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Maceio",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DictatorExperience({
  token,
  anthemUrl,
  decrees,
  onCreated,
}: {
  token: string;
  anthemUrl: string;
  decrees: Decree[];
  onCreated: (decree: Decree) => void;
}) {
  const [musicOpen, setMusicOpen] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) {
      setStatus("error");
      setFeedback("Escreva seu decreto antes de publicar.");
      return;
    }
    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch(`/api/invites/${encodeURIComponent(token)}/decrees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: clean, idempotencyKey: idempotencyKey.current }),
      });
      const body = (await response.json()) as { decree?: Decree; error?: string };
      if (!response.ok || !body.decree) throw new Error(body.error || "O palácio não conseguiu salvar agora.");
      onCreated(body.decree);
      setText("");
      idempotencyKey.current = crypto.randomUUID();
      setStatus("success");
      setFeedback("Decreto salvo no palácio! 🫡❤️");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "O palácio não conseguiu salvar agora.");
    }
  };

  return (
    <section className="dictator-section" aria-labelledby="dictator-title">
      <header className="section-heading royal-heading">
        <div className="royal-seal" aria-hidden="true">♛</div>
        <p className="eyebrow">Palácio dos Decretos da Yasmin</p>
        <h1 id="dictator-title">Yasmin Ditador <span aria-hidden="true">👑</span></h1>
        <p>Aqui, quem dá as ordens é você. E eu obedeço (quase) sempre! ❤️</p>
      </header>

      <div className="dictator-grid">
        <div className="dictator-media">
          <div className="meme-frame">
            <Image src="/assets/yasmin-ditador.webp" alt="Montagem Yasmin Ditador com suas frases originais" width={1080} height={1440} priority />
          </div>
          {!musicOpen ? (
            <button className="anthem-button" type="button" onClick={() => setMusicOpen(true)}>
              <span aria-hidden="true">▶</span> Tocar hino da ditadora
            </button>
          ) : (
            <div className="anthem-player page-enter">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId(anthemUrl)}?autoplay=1&rel=0`}
                title="Kylian Mbappe Dictador Anthem, de SurNervis"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <a href={anthemUrl} target="_blank" rel="noreferrer">Abrir música no YouTube ↗</a>
            </div>
          )}
        </div>

        <div className="decree-column">
          <form className="decree-form" onSubmit={submit}>
            <span className="paper-crown" aria-hidden="true">♛</span>
            <p className="form-kicker">Edital real nº {String(decrees.length + 1).padStart(2, "0")}</p>
            <h2>Minha rainha, o que vamos fazer hoje? 👑</h2>
            <label htmlFor="decree">Escreva sua ordem real</label>
            <textarea
              id="decree"
              value={text}
              maxLength={500}
              rows={5}
              onChange={(event) => { setText(event.target.value); if (status !== "sending") setStatus("idle"); }}
              placeholder="Ex.: Quero bolo de chocolate hoje…"
              aria-describedby="decree-count decree-feedback"
            />
            <div className="textarea-meta"><span>Vale mandar carinho junto.</span><b id="decree-count">{text.length}/500</b></div>
            <div className="suggestions" aria-label="Sugestões de decreto">
              {siteConfig.decreeSuggestions.map((suggestion) => (
                <button type="button" onClick={() => setText(suggestion)} key={suggestion}>{suggestion}</button>
              ))}
            </div>
            <button className="royal-submit" type="submit" disabled={status === "sending" || !text.trim()}>
              {status === "sending" ? "Selando o decreto…" : "Publicar decreto real 👑"}
            </button>
            <p id="decree-feedback" className={`form-feedback ${status}`} role="status">{feedback}</p>
            {status === "success" && <div className="mini-confetti" aria-hidden="true"><i>♥</i><i>✦</i><i>♡</i><i>✦</i></div>}
          </form>

          <div className="decree-history">
            <div className="history-heading"><div><p className="eyebrow">Arquivo real</p><h2>Seus decretos</h2></div><span>{decrees.length}</span></div>
            {decrees.length === 0 ? (
              <p className="empty-state">O livro do palácio ainda está em branco. Seu primeiro decreto aparecerá aqui.</p>
            ) : (
              <ul>
                {decrees.map((decree) => (
                  <li key={decree.id}>
                    <div><span className={`status-dot ${decree.status}`} /> <b>{statusLabels[decree.status]}</b><time>{localDate(decree.created_at)}</time></div>
                    <p>{decree.texto}</p>
                    {decree.resposta_do_namorado && <blockquote>“{decree.resposta_do_namorado}” <small>— seu namorado</small></blockquote>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
