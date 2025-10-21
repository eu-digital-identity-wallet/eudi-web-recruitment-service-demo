import { Job } from '../entities/Job';

import type { CredentialType } from '../types';
import type { JobPosting as PrismaJob } from '@prisma/client';

export class JobMapper {
	/**
	 * Convert Prisma model to Domain entity
	 */
	static toDomain(prismaJob: PrismaJob): Job {
		return Job.reconstitute({
			id: prismaJob.id,
			title: prismaJob.title,
			description: prismaJob.description,
			requiredCredentials: prismaJob.requiredCredentials as CredentialType,
			createdAt: prismaJob.createdAt,
		});
	}

	/**
	 * Convert Domain entity to Prisma update data
	 */
	static toPersistence(domain: Job): Partial<PrismaJob> {
		return {
			id: domain.getId(),
			title: domain.getTitle(),
			description: domain.getDescription(),
			requiredCredentials: domain.getRequiredCredentials(),
			createdAt: domain.getCreatedAt(),
		};
	}

	/**
	 * Convert multiple Prisma models to Domain entities
	 */
	static toDomainList(prismaJobs: PrismaJob[]): Job[] {
		return prismaJobs.map((job) => JobMapper.toDomain(job));
	}
}
