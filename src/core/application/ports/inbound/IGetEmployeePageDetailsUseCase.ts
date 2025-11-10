import type { EmployeePageDetailsDTO } from '@/core/application/usecases/GetEmployeePageDetailsUseCase';

/**
 * Inbound Port: Get Employee Page Details Use Case
 * Defines the contract for retrieving all data needed for the employee page
 * Returns DTO (plain data) instead of domain entities
 */
export interface IGetEmployeePageDetailsUseCase {
	execute(applicationId: string): Promise<EmployeePageDetailsDTO>;
}
