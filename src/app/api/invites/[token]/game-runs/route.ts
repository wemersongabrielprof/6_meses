import { NextResponse } from "next/server";
import { calculateScore, collectedAllCategories } from "@/lib/game";
import { requireInvite } from "@/lib/guest";
import { apiErrorResponse, readJson } from "@/lib/http";
import { enforceInviteRateLimit } from "@/lib/rate-limit";
import { gameRunSchema } from "@/lib/schemas";
import { assertSameOrigin } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    assertSameOrigin(request);
    const { token } = await context.params;
    const invite = await requireInvite(token);
    const payload = gameRunSchema.parse(await readJson(request));
    await enforceInviteRateLimit(invite.id, "game_run", 8, 60);
    const supabase = createServiceClient();

    const { count, error: countError } = await supabase
      .from("game_runs")
      .select("id", { count: "exact", head: true })
      .eq("invite_id", invite.id);
    if (countError) throw countError;

    const serverScore = calculateScore(payload.items);
    const won = collectedAllCategories(payload.items);
    const { data, error } = await supabase
      .from("game_runs")
      .insert({
        invite_id: invite.id,
        client_run_id: payload.clientRunId,
        score: serverScore,
        duration_seconds: payload.durationSeconds,
        chocolate_cakes: payload.items.cake,
        macchi_collars: payload.items.collar,
        bags: payload.items.bag,
        zara_clothes: payload.items.zara,
        won,
        attempts: (count ?? 0) + 1,
      })
      .select("id,score,won,attempts,created_at")
      .single();

    if (error?.code === "23505") {
      const existing = await supabase
        .from("game_runs")
        .select("id,score,won,attempts,created_at")
        .eq("client_run_id", payload.clientRunId)
        .eq("invite_id", invite.id)
        .single();
      if (existing.error) throw existing.error;
      return NextResponse.json({ run: existing.data, duplicate: true });
    }
    if (error) throw error;

    await supabase.from("activity_events").insert({
      invite_id: invite.id,
      event_type: "game_finished",
      idempotency_key: crypto.randomUUID(),
      metadata: { game_run_id: data.id, score: serverScore, won },
    });

    return NextResponse.json({ run: data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
