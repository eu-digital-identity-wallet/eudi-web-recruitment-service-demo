import "server-only";
import { Service } from "@/server/container";
import { prisma } from "@/server/prisma";
import type { ApplicationStatus } from "@prisma/client";

@Service()
export class ApplicationRepository {
  async create(jobId: string): Promise<{ id: string }> {
    const app = await prisma.application.create({ data: { jobId } });
    return { id: app.id };
  }

  async setVerificationInit(appId: string, opts: {
    transactionId?: string;
    requestUri?: string;
    sameDeviceFlow: boolean;
  }) {
    await prisma.application.update({
      where: { id: appId },
      data: {
        verifierTransactionId: opts.transactionId,
        verifierRequestUri: opts.requestUri,
        sameDeviceFlow: opts.sameDeviceFlow,
      },
    });
  }

  async setVerified(appId: string, data: { family: string; given: string; email: string; phone: string ;nationality: string}) {
    await prisma.application.update({
      where: { id: appId },
      data: {
        status: "VERIFIED",
        candidateFamilyName: data.family,
        candidateGivenName: data.given,
        candidateEmail:data.email,
        candidateMobilePhone:data.phone,
        candidateNationality:data.nationality
      },
    });
  }
  
  async setIssued(appId: string, url: string) {
    await prisma.application.update({
      where: { id: appId },
      data: { status: "ISSUED", credentialOfferUrl: url },
    });
  }
  async get(appId: string) {
    return prisma.application.findUnique({ where: { id: appId }, include: { job: true } });
  }
  async setStatus(appId: string, status: ApplicationStatus) {
    await prisma.application.update({ where: { id: appId }, data: { status } });
  }
}
