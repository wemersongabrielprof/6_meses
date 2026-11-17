import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { apiErrorResponse, readJson } from "@/lib/http";
import { decreeUpdateSchema, uuidSchema } from "@/lib/schemas";
import { assertSameOrigin } from "@/lib/security";
import { createServiceClient } from "@/lib/supabase/service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id: rawId } = await context.params;
    const id = uuidSchema.parse(rawId);
    const payload = decreeUpdateSchema.parse(await readJson(request));
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("decrees")
      .update({ status: payload.status, resposta_do_namorado: payload.resposta || null })
      .eq("id", id)
      .select("id,invite_id,texto,status,resposta_do_namorado,created_at,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ decree: data });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
