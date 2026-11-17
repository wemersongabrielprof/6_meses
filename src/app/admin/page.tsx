import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel do namorado · 6 meses" };

export default async function AdminPage() {
  let email = "Administrador";
  try {
    const user = await requireAdmin();
    email = user.email ?? email;
  } catch {
    redirect("/admin/login");
  }
  return <AdminDashboard email={email} />;
}
