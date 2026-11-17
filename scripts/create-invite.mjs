import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

try { process.loadEnvFile(".env.local"); } catch { /* Variáveis também podem vir do shell. */ }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
if (!url || !key) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local.");

const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("hex");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await supabase
  .from("invites")
  .insert({ label: "Yasmin", token_hash: tokenHash, token_value: token })
  .select("id")
  .single();

if (error) throw error;
console.log("Convite criado com sucesso.");
console.log(`ID: ${data.id}`);
console.log(`Link da Yasmin: ${siteUrl}/s/${token}`);
console.log("Guarde o link em local seguro. Ele também poderá ser copiado pelo painel admin.");
