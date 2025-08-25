import { NextRequest, NextResponse } from "next/server";
import { exportCampaignData } from "../../../../actions/export-campaign-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const sinceDays = Number(searchParams.get("sinceDays") ?? 90);
  const includeSends = searchParams.get("includeSends") !== "0";
  const sendsLimitPerCampaign = Number(searchParams.get("sendsLimitPerCampaign") ?? 200);

  try {
    const data = await exportCampaignData({
      sinceDays,
      includeSends,
      sendsLimitPerCampaign,
    });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "export failed" }, { status: 500 });
  }
}