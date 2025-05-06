import { z } from 'zod';

export const baseResponseSchema = z.object({
    headers: z.record(z.string()).optional(),
    statusCode: z.number(),
    body: z.string(),
});
