import { NextResponse } from "next/server";
import { Container } from "@/server";
import { ApplicationService } from "@/server/services/ApplicationService";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const applicationService = Container.get(ApplicationService);
    const { id: applicationId } = await params;

    // Issue the application receipt credential
    const result = await applicationService.issueReceipt(applicationId);

    if (!result) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      offerUrl: result.offerUrl,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to issue receipt";
    const code = /not found/i.test(msg) ? 404 : /cannot issue/i.test(msg) ? 400 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}