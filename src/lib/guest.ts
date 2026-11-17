import "server-only";

import { ApiError } from "@/lib/http";
import { assertTokenShape, hashInviteToken } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/service";
import type { InviteRecord } from "@/lib/types";

export async function requireInvite(token: string): Promise<InviteRecord> {
  assertTokenShape(token);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("invites")
    .select("id,label,token_value,active,expires_at,created_at")
    .eq("token_hash", hashInviteToken(token))
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.active || (data.expires_at && new Date(data.expires_at) <= new Date())) {
    throw new ApiError("Convite inválido ou expirado.", 404);
  }

  return data as InviteRecord;
}
