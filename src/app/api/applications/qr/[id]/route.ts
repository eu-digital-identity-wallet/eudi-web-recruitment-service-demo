// src/app/api/applications/qr/[id]/route.ts
import { NextResponse } from "next/server";
import { Container } from "@/server";
import { ApplicationService } from "@/server/services/ApplicationService";
import QRCode from "qrcode";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const applicationService = Container.get(ApplicationService);
  const { id } = await ctx.params;
  const link = await applicationService.deepLink(id);
  console.log("[QR PID] Deep link:", link);
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
