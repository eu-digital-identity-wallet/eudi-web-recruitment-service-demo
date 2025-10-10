import "server-only";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/server";
import { ApplicationService } from "@/server/services/ApplicationService";

interface CallbackPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ response_code?: string }>;
}

export const dynamic = "force-dynamic";

export default async function CallbackPage({
  params,
  searchParams
}: CallbackPageProps) {
  const applicationService = Container.get(ApplicationService);
  const { id } = await params;
  const { response_code } = await searchParams;

  if (!id || !response_code) {
    return notFound();
  }

  try {
    // Process the verification with the response code
    const success = await applicationService.verificationStatus({
      applicationId: id,
      responseCode: response_code
    });

    if (success) {
      // Redirect to confirmation page on successful verification
      redirect(`/applications/${id}/confirmation`);
    } else {
      // Redirect to error page or show error
      redirect(`/applications/${id}?error=verification_failed`);
    }
  } catch (error) {
    // Re-throw redirect errors - they're not actual errors
    if (error && typeof error === 'object' && 'digest' in error &&
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error processing callback:", error);
    redirect(`/applications/${id}?error=callback_error`);
  }
}