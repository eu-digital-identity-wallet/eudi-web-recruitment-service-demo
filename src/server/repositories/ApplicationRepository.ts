import "server-only";
import { Service } from "@/server/container";
import { prisma } from "@/server/prisma";
import { Application, JobPosting, Prisma } from "@prisma/client";

@Service()
export class ApplicationRepository {
  /**
   * Find application by ID
   */
  async findById(id: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: { id }
    });
  }

  /**
   * Find application by ID with job relation
   */
  async findByIdWithJob(id: string): Promise<(Application & { job: JobPosting | null }) | null> {
    return prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });
  }

  /**
   * Create new application
   */
  async create(data: Prisma.ApplicationCreateInput): Promise<Application> {
    return prisma.application.create({
      data
    });
  }

  /**
   * Update application
   */
  async update(id: string, data: Prisma.ApplicationUpdateInput): Promise<Application> {
    return prisma.application.update({
      where: { id },
      data
    });
  }

  /**
   * Delete application (if needed)
   */
  async delete(id: string): Promise<Application> {
    return prisma.application.delete({
      where: { id }
    });
  }
}
