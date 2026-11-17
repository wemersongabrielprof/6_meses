import { NextResponse } from "next/server";
import { requireInvite } from "@/lib/guest";
import { apiErrorResponse, readJson } from "@/lib/http";
import { enforceInviteRateLimit } from "@/lib/rate-limit";
import { albumEventSchema } from "@/lib/schemas";
import { assertSameOrigin } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    assertSameOrigin(request);
    const { token } = await context.params;
    const invite = await requireInvite(token);
    const payload = albumEventSchema.parse(await readJson(request));
    await enforceInviteRateLimit(invite.id, `album_${payload.eventType}`, payload.eventType === "liked" ? 30 : 60, 60);
    const supabase = createServiceClient();
    const { error } = await supabase.from("album_events").insert({
      invite_id: invite.id,
      photo_id: payload.photoId,
      event_type: payload.eventType,
      idempotency_key: payload.idempotencyKey,
    });

    if (error && error.code !== "23505") throw error;
    return NextResponse.json({ saved: true, duplicate: error?.code === "23505" });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
