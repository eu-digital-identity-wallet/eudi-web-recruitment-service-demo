import { z } from "zod";

export const applicationCreateSchema = z.object({
  jobId: z.string().min(1),
  sameDeviceFlow: z.boolean(),
});

export const applicationIdSchema = z.string().min(1);

export const applicationVerificationSchema = z.object({
  applicationId: z.string().min(1),
  responseCode: z.string().optional(),
});

export type ApplicationCreateDto = z.infer<typeof applicationCreateSchema>;
export type ApplicationVerificationDto = z.infer<typeof applicationVerificationSchema>;
export type ApplicationIdDto = z.infer<typeof applicationIdSchema>;