import "server-only";
import { Inject, Service } from "@/server/container";
import { ValidateInput } from "@/server/decorators/validate-input";
import { JobRepository } from "@/server/repositories/JobRepository";
import {  jobIdSchema } from "@/server/schemas/job";
import type { JobPosting } from "@prisma/client";

@Service()
export class JobService {
  constructor(@Inject() private readonly jobs: JobRepository) {}

  /** List jobs for the board (used by /jobs page) */
  public async list(): Promise<JobPosting[]> {
    return this.jobs.list();
  }

  /** Single job details */
  @ValidateInput(jobIdSchema)
  public async get(id: string): Promise<JobPosting | null> {
    return this.jobs.get(id);
  }
}
