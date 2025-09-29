import { z } from "zod";

export const jobIdSchema = z.string().min(1);