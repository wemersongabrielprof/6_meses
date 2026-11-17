import "server-only";

import { ApiError } from "@/lib/http";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function requireAdmin() {
  const auth = await createServerAuthClient();
  const { data, error } = await auth.auth.getUser();
  if (error || !data.user) throw new ApiError("Faça login para continuar.", 401);

  const service = createServiceClient();
  const { data: admin, error: adminError } = await service
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!admin) throw new ApiError("Este usuário não tem acesso administrativo.", 403);
  return data.user;
}
