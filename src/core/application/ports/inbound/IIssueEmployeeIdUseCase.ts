/**
 * Inbound Port: Issue Employee ID Use Case
 * Defines the contract for issuing an Employee ID credential via OpenID4VCI
 */
export interface IIssueEmployeeIdUseCase {
	execute(applicationId: string): Promise<{ offerUrl: string; otp?: string } | null>;
}
