import type { ApplicationFinalizationDTO } from '@/core/application/usecases/GetApplicationFinalizationDataUseCase';

/**
 * Inbound Port: Get Application Finalization Data
 * Returns comprehensive data for the application finalization page including:
 * - Application details
 * - Verified credentials
 * - Professional qualifications
 * - Page access control results
 */
export interface IGetApplicationFinalizationDataUseCase {
	execute(applicationId: string): Promise<ApplicationFinalizationDTO | null>;
}
