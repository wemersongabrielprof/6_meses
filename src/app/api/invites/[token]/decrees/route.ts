import { NextResponse } from "next/server";
import { requireInvite } from "@/lib/guest";
import { apiErrorResponse, readJson } from "@/lib/http";
import { notifyNewDecree } from "@/lib/notify";
import { enforceInviteRateLimit } from "@/lib/rate-limit";
import { decreeCreateSchema } from "@/lib/schemas";
import { assertSameOrigin } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    assertSameOrigin(request);
    const { token } = await context.params;
    const invite = await requireInvite(token);
    const payload = decreeCreateSchema.parse(await readJson(request));
    await enforceInviteRateLimit(invite.id, "decree", 5, 60);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("decrees")
      .insert({
        invite_id: invite.id,
        texto: payload.texto,
        idempotency_key: payload.idempotencyKey,
      })
      .select("id,invite_id,texto,status,resposta_do_namorado,created_at,updated_at")
      .single();

    if (error?.code === "23505") {
      const existing = await supabase
        .from("decrees")
        .select("id,invite_id,texto,status,resposta_do_namorado,created_at,updated_at")
        .eq("idempotency_key", payload.idempotencyKey)
        .eq("invite_id", invite.id)
        .single();
      if (existing.error) throw existing.error;
      return NextResponse.json({ decree: existing.data, duplicate: true });
    }
    if (error) throw error;

    await supabase.from("activity_events").insert({
      invite_id: invite.id,
      event_type: "decree_created",
      idempotency_key: crypto.randomUUID(),
      metadata: { decree_id: data.id },
    });
    void notifyNewDecree(payload.texto);

    return NextResponse.json({ decree: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
