import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiErrorResponse } from "@/lib/http";
import { createServiceClient } from "@/lib/supabase/service";
import type { ActivityEvent, AlbumEvent, Decree, GameRun, InviteRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    const [invites, decrees, runs, albumEvents, activityEvents] = await Promise.all([
      supabase.from("invites").select("id,label,token_value,active,expires_at,created_at").order("created_at"),
      supabase
        .from("decrees")
        .select("id,invite_id,texto,status,resposta_do_namorado,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("game_runs")
        .select("id,invite_id,score,duration_seconds,chocolate_cakes,macchi_collars,bags,zara_clothes,won,attempts,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("album_events")
        .select("id,invite_id,photo_id,event_type,created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("activity_events")
        .select("id,invite_id,event_type,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    for (const result of [invites, decrees, runs, albumEvents, activityEvents]) {
      if (result.error) throw result.error;
    }

    const decreeRows = (decrees.data ?? []) as Decree[];
    const runRows = (runs.data ?? []) as GameRun[];
    const albumRows = (albumEvents.data ?? []) as AlbumEvent[];
    const activityRows = (activityEvents.data ?? []) as ActivityEvent[];
    const inviteRows = (invites.data ?? []) as InviteRecord[];

    return NextResponse.json(
      {
        stats: {
          newDecrees: decreeRows.filter((item) => item.status === "recebido").length,
          bestScore: Math.max(0, ...runRows.map((item) => item.score)),
          gameRuns: runRows.length,
          albumOpens: albumRows.filter((item) => item.event_type === "opened").length,
          hearts: albumRows.filter((item) => item.event_type === "liked").length,
          visits: activityRows.filter((item) => item.event_type === "visit").length,
        },
        invites: inviteRows.map((item) => ({ id: item.id, label: item.label, token: item.token_value, active: item.active })),
        decrees: decreeRows,
        gameRuns: runRows,
        albumEvents: albumRows,
        activityEvents: activityRows,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
