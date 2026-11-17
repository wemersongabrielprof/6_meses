import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Acesso administrativo · 6 meses" };

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-brand"><span>Y</span><div><b>Nosso cantinho</b><small>área do namorado</small></div></div>
        <p className="eyebrow">Acesso reservado</p>
        <h1>Entre no painel</h1>
        <p>Use o e-mail e a senha cadastrados no Supabase Auth.</p>
        <LoginForm />
      </div>
    </main>
  );
}
