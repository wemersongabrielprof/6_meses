import "server-only";

import { ApiError } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/service";

export async function enforceInviteRateLimit(
  inviteId: string,
  action: string,
  limit: number,
  windowSeconds: number,
) {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("invite_id", inviteId)
    .eq("action", action)
    .gte("created_at", since);

  if (error) throw error;
  if ((count ?? 0) >= limit) {
    throw new ApiError("Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.", 429);
  }

  const { error: insertError } = await supabase.from("rate_limit_events").insert({
    invite_id: inviteId,
    action,
  });
  if (insertError) throw insertError;
}
