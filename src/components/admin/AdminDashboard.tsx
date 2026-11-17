"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { AdminOverview, DecreeStatus } from "@/lib/types";

const statusLabel: Record<DecreeStatus, string> = {
  recebido: "Recebido",
  em_andamento: "Em andamento",
  cumprido: "Cumprido",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Maceio",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState("");
  const [copyState, setCopyState] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }
      const body = (await response.json()) as AdminOverview & { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível atualizar o painel.");
      setData(body);
      setResponses((current) => {
        const next = { ...current };
        for (const decree of body.decrees) if (!(decree.id in next)) next[decree.id] = decree.resposta_do_namorado ?? "";
        return next;
      });
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o painel.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const firstRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(refresh, 5_000);
    return () => {
      window.clearTimeout(firstRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const updateDecree = async (id: string, status: DecreeStatus) => {
    setSaving(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/decrees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resposta: responses[id]?.trim() || null }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível atualizar o decreto.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar o decreto.");
    } finally {
      setSaving("");
    }
  };

  const copyInvite = async (token: string) => {
    const link = `${window.location.origin}/s/${token}`;
    await navigator.clipboard.writeText(link);
    setCopyState("Link copiado!");
    window.setTimeout(() => setCopyState(""), 2_000);
  };

  const logout = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  if (loading) return <main className="admin-loading"><span>♥</span><p>Abrindo o painel…</p></main>;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>Y</span><div><b>Nosso cantinho</b><small>painel do namorado</small></div></div>
        <nav aria-label="Seções do painel">
          <a href="#resumo">Resumo</a><a href="#decretos">Decretos</a><a href="#partidas">Pedal do amor</a><a href="#album">Álbum</a>
        </nav>
        <div className="admin-user"><small>Conectado como</small><span>{email}</span><button type="button" onClick={logout}>Sair</button></div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div><p className="eyebrow">Visão privada</p><h1>Olá! O palácio está em ordem.</h1><p>Atualização automática a cada 5 segundos · horários de Maceió</p></div>
          <div className="invite-actions">
            {data?.invites[0] ? <button type="button" onClick={() => copyInvite(data.invites[0].token)}>Copiar convite da Yasmin</button> : <span>Nenhum convite criado</span>}
            <small role="status">{copyState}</small>
          </div>
        </header>

        {error && <div className="admin-alert" role="alert">{error} <button type="button" onClick={refresh}>Tentar novamente</button></div>}

        <section id="resumo" className="stats-grid" aria-label="Resumo">
          <article><span>👑</span><small>Novos decretos</small><b>{data?.stats.newDecrees ?? 0}</b></article>
          <article><span>🚲</span><small>Melhor pontuação</small><b>{data?.stats.bestScore ?? 0}</b></article>
          <article><span>♥</span><small>Corações no álbum</small><b>{data?.stats.hearts ?? 0}</b></article>
          <article><span>✦</span><small>Visitas importantes</small><b>{data?.stats.visits ?? 0}</b></article>
        </section>

        <section id="decretos" className="admin-panel">
          <div className="panel-title"><div><p className="eyebrow">Pedidos reais</p><h2>Decretos da Yasmin</h2></div><span>{data?.decrees.length ?? 0} no total</span></div>
          {!data?.decrees.length ? <p className="empty-state">Quando Yasmin publicar um decreto, ele aparecerá aqui — sem dados de demonstração.</p> : (
            <div className="admin-decrees">
              {data.decrees.map((decree) => (
                <article key={decree.id}>
                  <div className="decree-admin-meta"><span className={`status-pill ${decree.status}`}>{statusLabel[decree.status]}</span><time>{formatDate(decree.created_at)}</time></div>
                  <p>{decree.texto}</p>
                  <label htmlFor={`reply-${decree.id}`}>Resposta carinhosa</label>
                  <textarea id={`reply-${decree.id}`} maxLength={300} rows={2} value={responses[decree.id] ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [decree.id]: event.target.value }))} placeholder="Ex.: Ordem recebida, minha rainha!" />
                  <div className="decree-actions">
                    {(["recebido", "em_andamento", "cumprido"] as DecreeStatus[]).map((status) => (
                      <button type="button" disabled={saving === decree.id} className={decree.status === status ? "active" : ""} onClick={() => updateDecree(decree.id, status)} key={status}>{statusLabel[status]}</button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="partidas" className="admin-panel">
          <div className="panel-title"><div><p className="eyebrow">Ranking real</p><h2>Pedal do Amor</h2></div><span>{data?.stats.gameRuns ?? 0} partidas</span></div>
          {!data?.gameRuns.length ? <p className="empty-state">Nenhuma volta de bicicleta foi concluída ainda.</p> : (
            <div className="table-wrap"><table><thead><tr><th>Quando</th><th>Pontos</th><th>Meta</th><th>🎂</th><th>🐶</th><th>👜</th><th>👗 Zara</th><th>Tentativa</th></tr></thead><tbody>
              {data.gameRuns.map((run) => <tr key={run.id}><td>{formatDate(run.created_at)}</td><td><strong>{run.score}</strong></td><td>{run.won ? "Completa ✨" : "Incompleta"}</td><td>{run.chocolate_cakes}</td><td>{run.macchi_collars}</td><td>{run.bags}</td><td>{run.zara_clothes}</td><td>#{run.attempts}</td></tr>)}
            </tbody></table></div>
          )}
        </section>

        <section id="album" className="admin-panel album-admin-grid">
          <div>
            <div className="panel-title"><div><p className="eyebrow">Lembranças</p><h2>Interações do álbum</h2></div><span>{data?.stats.albumOpens ?? 0} aberturas</span></div>
            {!data?.albumEvents.length ? <p className="empty-state">O álbum ainda não foi aberto.</p> : <ul className="activity-list">{data.albumEvents.slice(0, 20).map((event) => <li key={event.id}><span>{event.event_type === "liked" ? "♥" : "📸"}</span><p><b>Foto {event.photo_id}</b><small>{event.event_type === "liked" ? "Recebeu um coração" : "Foi aberta"}</small></p><time>{formatDate(event.created_at)}</time></li>)}</ul>}
          </div>
          <div>
            <div className="panel-title"><div><p className="eyebrow">Atividade essencial</p><h2>Últimos acontecimentos</h2></div></div>
            {!data?.activityEvents.length ? <p className="empty-state">Nenhuma atividade registrada.</p> : <ul className="activity-list">{data.activityEvents.slice(0, 20).map((event) => <li key={event.id}><span>✦</span><p><b>{event.event_type === "visit" ? "Surpresa visitada" : event.event_type === "game_finished" ? "Partida concluída" : "Decreto publicado"}</b><small>Evento significativo</small></p><time>{formatDate(event.created_at)}</time></li>)}</ul>}
          </div>
        </section>
      </div>
    </main>
  );
}
