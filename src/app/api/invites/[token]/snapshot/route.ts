import { NextResponse } from "next/server";
import { requireInvite } from "@/lib/guest";
import { apiErrorResponse } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/service";
import type { Decree } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const invite = await requireInvite(token);
    const supabase = createServiceClient();
    const [decreesResult, likesResult] = await Promise.all([
      supabase
        .from("decrees")
        .select("id,invite_id,texto,status,resposta_do_namorado,created_at,updated_at")
        .eq("invite_id", invite.id)
        .order("created_at", { ascending: false }),
      supabase.from("album_events").select("photo_id").eq("invite_id", invite.id).eq("event_type", "liked"),
    ]);

    if (decreesResult.error) throw decreesResult.error;
    if (likesResult.error) throw likesResult.error;
    const likeCounts: Record<number, number> = {};
    for (const row of likesResult.data ?? []) likeCounts[row.photo_id] = (likeCounts[row.photo_id] ?? 0) + 1;

    return NextResponse.json(
      { decrees: (decreesResult.data ?? []) as Decree[], likeCounts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
