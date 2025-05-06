import { successResponseSchema } from './success';
import { errorResponseSchema } from './error';
import { z } from 'zod';

/**
 * Combined schema for Lambda responses
 * Validates responses based on their status code:
 * - 200: Success response
 * - 400-599: Error response
 */
export const combinedResponseSchema = z.union([successResponseSchema, errorResponseSchema]);
