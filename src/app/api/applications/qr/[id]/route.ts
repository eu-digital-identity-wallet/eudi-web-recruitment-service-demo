// src/app/api/applications/qr/[id]/route.ts
import { NextResponse } from "next/server";
import { applicationService } from "@/server";
import QRCode from "qrcode";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const link = await applicationService.deepLink(id);
  const svg = await QRCode.toString(link, { type: "svg", errorCorrectionLevel: "M", margin: 1, width: 256 });
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
