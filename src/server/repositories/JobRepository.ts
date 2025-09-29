import "server-only";
import { Service } from "@/server/container";
import { prisma } from "@/server/prisma";
import type { JobPosting } from "@prisma/client";

@Service()
export class JobRepository {
  async list(): Promise<JobPosting[]> {
    return prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });
  }

  async get(id: string): Promise<JobPosting | null> {
    return prisma.jobPosting.findUnique({ where: { id } });
  }

  // async create(data: Pick<JobPosting, "title" | "description" | "requiresDL">): Promise<JobPosting> {
  //   return prisma.jobPosting.create({ data });
  // }

  // async update(
  //   id: string,
  //   data: Partial<Pick<JobPosting, "title" | "description" | "requiresDL">>
  // ): Promise<JobPosting> {
  //   return prisma.jobPosting.update({ where: { id }, data });
  // }

  // async remove(id: string): Promise<void> {
  //   await prisma.jobPosting.delete({ where: { id } });
  // }
}
