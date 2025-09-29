import "server-only";
import "@/server/container";
import { Container } from "@/server/container";
import { JobService } from "@/server/services/JobService";
import { ApplicationService } from "@/server/services/ApplicationService";

// Expose resolved services for route handlers
export const jobService = Container.get(JobService);
export const applicationService = Container.get(ApplicationService);
