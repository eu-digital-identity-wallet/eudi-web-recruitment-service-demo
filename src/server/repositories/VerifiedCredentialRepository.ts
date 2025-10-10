import "server-only";
import { Service } from "@/server/container";
import { prisma } from "@/server/prisma";
import { VerifiedCredential, Prisma, CredentialType } from "@prisma/client";

@Service()
export class VerifiedCredentialRepository {
  /**
   * Find verified credential by transaction ID
   */
  async findByTransactionId(transactionId: string): Promise<VerifiedCredential | null> {
    return prisma.verifiedCredential.findFirst({
      where: { verifierTransactionId: transactionId }
    });
  }

  /**
   * Find all verified credentials for an application
   */
  async findByApplicationId(applicationId: string): Promise<VerifiedCredential[]> {
    return prisma.verifiedCredential.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" }
    });
  }

  /**
   * Find specific credential type for an application
   */
  async findByApplicationIdAndType(
    applicationId: string,
    credentialType: CredentialType
  ): Promise<VerifiedCredential | null> {
    return prisma.verifiedCredential.findFirst({
      where: {
        applicationId,
        credentialType
      }
    });
  }

  /**
   * Create new verified credential (pending verification)
   */
  async create(data: Prisma.VerifiedCredentialCreateInput): Promise<VerifiedCredential> {
    return prisma.verifiedCredential.create({
      data
    });
  }

  /**
   * Update verified credential
   */
  async update(id: string, data: Prisma.VerifiedCredentialUpdateInput): Promise<VerifiedCredential> {
    return prisma.verifiedCredential.update({
      where: { id },
      data
    });
  }

  /**
   * Update by transaction ID
   */
  async updateByTransactionId(
    transactionId: string,
    data: Prisma.VerifiedCredentialUpdateInput
  ): Promise<VerifiedCredential | null> {
    const credential = await this.findByTransactionId(transactionId);
    if (!credential) return null;

    return this.update(credential.id, data);
  }

  /**
   * Delete verified credential
   */
  async delete(id: string): Promise<VerifiedCredential> {
    return prisma.verifiedCredential.delete({
      where: { id }
    });
  }
}
