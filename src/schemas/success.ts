import { HttpStatus } from '@nestjs/common';
import { baseResponseSchema } from './base';
import { z } from 'zod';

export const successResponseSchema = baseResponseSchema.extend({
    statusCode: z.literal(HttpStatus.OK),
    body: z.string(), // Lambda returns URLSearchParams.toString()
    headers: z.object({
        'Content-Type': z.literal('application/x-www-form-urlencoded'),
    }),
});
