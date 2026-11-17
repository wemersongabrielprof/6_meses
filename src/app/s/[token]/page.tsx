import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { SurpriseExperience } from "@/components/surprise/SurpriseExperience";
import { requireInvite } from "@/lib/guest";

export const dynamic = "force-dynamic";

export default async function SurprisePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    await requireInvite(token);
  } catch {
    notFound();
  }

  return (
    <SurpriseExperience
      token={token}
      anthemUrl={process.env.YOUTUBE_ANTHEM_URL || siteConfig.anthemUrl}
    />
  );
}
