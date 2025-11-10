/**
 * Inbound Port (Primary/Driving Port)
 *
 * Defines what the application DOES from the perspective of external actors.
 * This is the contract that use cases must implement.
 */
export interface ICreateApplicationUseCase {
	execute(params: {
		vacancyId: string;
		sameDeviceFlow: boolean;
	}): Promise<{ url: string; applicationId?: string }>;
}
