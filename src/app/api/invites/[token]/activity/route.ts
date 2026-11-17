import { NextResponse } from "next/server";
import { requireInvite } from "@/lib/guest";
import { apiErrorResponse, readJson } from "@/lib/http";
import { enforceInviteRateLimit } from "@/lib/rate-limit";
import { activityEventSchema } from "@/lib/schemas";
import { assertSameOrigin } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    assertSameOrigin(request);
    const { token } = await context.params;
    const invite = await requireInvite(token);
    const payload = activityEventSchema.parse(await readJson(request));
    await enforceInviteRateLimit(invite.id, "visit", 10, 3600);
    const supabase = createServiceClient();
    const { error } = await supabase.from("activity_events").insert({
      invite_id: invite.id,
      event_type: payload.eventType,
      idempotency_key: payload.idempotencyKey,
      metadata: {},
    });
    if (error && error.code !== "23505") throw error;
    return NextResponse.json({ saved: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
