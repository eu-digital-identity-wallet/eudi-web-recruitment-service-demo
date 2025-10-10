import "server-only";
import { Service } from "@/server/container";
import { prisma } from "@/server/prisma";
import { JobPosting, Prisma } from "@prisma/client";

@Service()
export class JobRepository {
  /**
   * Find all job postings, ordered by creation date
   */
  async findAll(): Promise<JobPosting[]> {
    return prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Find job posting by ID
   */
  async findById(id: string): Promise<JobPosting | null> {
    return prisma.jobPosting.findUnique({
      where: { id }
    });
  }

  /**
   * Create new job posting
   */
  async create(data: Prisma.JobPostingCreateInput): Promise<JobPosting> {
    return prisma.jobPosting.create({
      data
    });
  }

  /**
   * Update job posting
   */
  async update(id: string, data: Prisma.JobPostingUpdateInput): Promise<JobPosting> {
    return prisma.jobPosting.update({
      where: { id },
      data
    });
  }

  /**
   * Delete job posting
   */
  async delete(id: string): Promise<JobPosting> {
    return prisma.jobPosting.delete({
      where: { id }
    });
  }
}
