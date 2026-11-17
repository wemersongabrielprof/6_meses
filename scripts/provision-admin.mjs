import { createClient } from "@supabase/supabase-js";

try { process.loadEnvFile(".env.local"); } catch { /* Variáveis também podem vir do shell. */ }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!url || !key || !email || !password) {
  throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL e ADMIN_PASSWORD.");
}
if (password.length < 10) throw new Error("Use ADMIN_PASSWORD com pelo menos 10 caracteres.");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let userId;
const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (created.data.user) {
  userId = created.data.user.id;
} else {
  const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = listed.data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!existing) throw created.error || new Error("Não foi possível criar nem localizar o usuário.");
  userId = existing.id;
  console.log("Usuário Auth já existia; apenas o acesso administrativo será garantido.");
}

const { error } = await supabase.from("admin_users").upsert({ user_id: userId }, { onConflict: "user_id" });
if (error) throw error;
console.log(`Administrador provisionado: ${email} (${userId})`);
console.log("Remova ADMIN_EMAIL e ADMIN_PASSWORD do .env.local se não precisar executar este script novamente.");
