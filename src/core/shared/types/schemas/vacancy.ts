import { z } from 'zod';

export const vacancyIdSchema = z.string().min(1);
