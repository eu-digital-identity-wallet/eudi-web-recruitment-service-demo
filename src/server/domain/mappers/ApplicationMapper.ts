import { Application as PrismaApplication } from "@prisma/client";
import { Application } from "../entities/Application";
import { CandidateInfo } from "../value-objects/CandidateInfo";
import type { ApplicationStatus } from "../entities/Application";

export class ApplicationMapper {
  /**
   * Convert Prisma model to Domain entity
   */
  static toDomain(prismaApp: PrismaApplication): Application {
    let candidateInfo: CandidateInfo | undefined = undefined;

    if (prismaApp.candidateFamilyName && prismaApp.candidateGivenName) {
      candidateInfo = CandidateInfo.create({
        familyName: prismaApp.candidateFamilyName,
        givenName: prismaApp.candidateGivenName,
        email: prismaApp.candidateEmail || undefined,
        mobilePhone: prismaApp.candidateMobilePhone || undefined,
        nationality: prismaApp.candidateNationality || undefined,
        dateOfBirth: prismaApp.candidateDateOfBirth || undefined,
      });
    }

    return Application.reconstitute({
      id: prismaApp.id,
      jobId: prismaApp.jobId,
      status: prismaApp.status as ApplicationStatus,
      candidateInfo,
      createdAt: prismaApp.createdAt,
    });
  }

  /**
   * Convert Domain entity to Prisma update data
   */
  static toPersistence(domain: Application): Partial<PrismaApplication> {
    const candidateInfo = domain.getCandidateInfo();

    return {
      id: domain.getId(),
      jobId: domain.getJobId(),
      status: domain.getStatus(),
      candidateFamilyName: candidateInfo?.familyName || null,
      candidateGivenName: candidateInfo?.givenName || null,
      candidateEmail: candidateInfo?.email || null,
      candidateMobilePhone: candidateInfo?.mobilePhone || null,
      candidateNationality: candidateInfo?.nationality || null,
      candidateDateOfBirth: candidateInfo?.dateOfBirth || null,
    };
  }
}