import "server-only";
import { Inject, Service } from "@/server/container";
import { ValidateInput } from "@/server/decorators/validate-input";
import { JobRepository } from "@/server/repositories/JobRepository";
import { jobIdSchema } from "@/server/schemas/job";
import { Job, JobMapper } from "@/server/domain";

@Service()
export class JobService {
  constructor(
    @Inject() private readonly jobRepo: JobRepository
  ) {}

  /** List jobs for the board (used by /jobs page) */
  public async list(): Promise<Job[]> {
    try {
      const prismaJobs = await this.jobRepo.findAll();
      return JobMapper.toDomainList(prismaJobs);
    } catch {
      throw new Error(
        `Database connection failed. Please ensure PostgreSQL is running at localhost:5432 and the database is set up. Run: npx prisma db push`
      );
    }
  }

  /** Single job details */
  @ValidateInput(jobIdSchema)
  public async get(id: string): Promise<Job | null> {
    try {
      const prismaJob = await this.jobRepo.findById(id);
      if (!prismaJob) return null;
      return JobMapper.toDomain(prismaJob);
    } catch {
      throw new Error(
        `Database connection failed. Please ensure PostgreSQL is running at localhost:5432 and the database is set up. Run: npx prisma db push`
      );
    }
  }
}
