import type { Application, Vacancy } from '@prisma/client';

/**
 * Inbound Port: Get Application Details
 */
export interface IGetApplicationDetailsUseCase {
	execute(applicationId: string): Promise<(Application & { vacancy: Vacancy | null }) | null>;
}
