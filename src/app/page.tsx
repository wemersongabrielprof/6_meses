import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="gate-page">
      <div className="gate-card">
        <span className="gate-seal" aria-hidden="true">♥</span>
        <p className="eyebrow">Um cantinho particular</p>
        <h1>Esta surpresa precisa de um convite.</h1>
        <p>Se você recebeu um link especial, abra exatamente aquele endereço. O painel do namorado fica em uma área separada.</p>
        <Link className="text-link" href="/admin">Acesso administrativo</Link>
      </div>
    </main>
  );
}
