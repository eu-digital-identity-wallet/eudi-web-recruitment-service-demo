import { NextRequest, NextResponse } from "next/server";
import { applicationService } from "@/server";
import { z } from "zod";

const BodySchema = z.object({
  jobId: z.string().min(1),
  sameDevice: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const body = BodySchema.parse(json);

    const res = await applicationService.create({
      jobId: body.jobId,
      sameDeviceFlow: body.sameDevice,
    });

    // { url, applicationId? }
    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    const code = /not found/i.test(msg) ? 404 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
