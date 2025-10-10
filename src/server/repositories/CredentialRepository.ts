import "server-only";
import { Service } from "@/server/container";
import { prisma } from "@/server/prisma";
import { IssuedCredential, Prisma } from "@prisma/client";

@Service()
export class CredentialRepository {
  /**
   * Find credential by application ID and type
   */
  async findByApplicationIdAndType(
    applicationId: string,
    credentialType: string
  ): Promise<IssuedCredential | null> {
    return prisma.issuedCredential.findFirst({
      where: {
        applicationId,
        credentialType
      }
    });
  }

  /**
   * Find all credentials for an application
   */
  async findByApplicationId(applicationId: string): Promise<IssuedCredential[]> {
    return prisma.issuedCredential.findMany({
      where: { applicationId }
    });
  }

  /**
   * Find credential by pre-authorized code
   */
  async findByPreAuthorizedCode(preAuthorizedCode: string): Promise<IssuedCredential | null> {
    return prisma.issuedCredential.findFirst({
      where: { preAuthorizedCode }
    });
  }

  /**
   * Create new issued credential
   */
  async create(data: Prisma.IssuedCredentialCreateInput): Promise<IssuedCredential> {
    return prisma.issuedCredential.create({
      data
    });
  }

  /**
   * Update issued credential
   */
  async update(id: string, data: Prisma.IssuedCredentialUpdateInput): Promise<IssuedCredential> {
    return prisma.issuedCredential.update({
      where: { id },
      data
    });
  }

  /**
   * Delete issued credential
   */
  async delete(id: string): Promise<IssuedCredential> {
    return prisma.issuedCredential.delete({
      where: { id }
    });
  }
}
