import Link from "next/link";

export default function NotFound() {
  return (
    <main className="gate-page">
      <div className="gate-card">
        <span className="gate-seal" aria-hidden="true">♡</span>
        <p className="eyebrow">Convite não encontrado</p>
        <h1>Este caminho não abre o nosso presente.</h1>
        <p>Confirme se o link foi copiado por inteiro ou peça um convite novo.</p>
        <Link className="text-link" href="/">Voltar</Link>
      </div>
    </main>
  );
}
