import { HttpStatus } from '@nestjs/common';
import { baseResponseSchema } from './base';
import { z } from 'zod';

export const errorResponseSchema = baseResponseSchema.extend({
    statusCode: z.union([z.literal(HttpStatus.BAD_REQUEST), z.literal(HttpStatus.INTERNAL_SERVER_ERROR)]),
    body: z.string(),
    headers: z.object({
        'Content-Type': z.literal('application/json'),
    }),
});
