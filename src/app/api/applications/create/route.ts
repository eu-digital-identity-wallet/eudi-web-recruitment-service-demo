import { NextRequest, NextResponse } from "next/server";
import { Container } from "@/server";
import { ApplicationService } from "@/server/services/ApplicationService";

export async function POST(req: NextRequest) {
  try {
    const applicationService = Container.get(ApplicationService);
    const json = await req.json().catch(() => ({}));

    // Initial application always uses PID (Personal ID) verification
    const res = await applicationService.create({
      jobId: json.jobId,
      sameDeviceFlow: json.sameDevice ?? false,
    });

    // { url, applicationId? }
    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    const code = /not found/i.test(msg) ? 404 : 400;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
