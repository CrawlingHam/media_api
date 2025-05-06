import { errorResponseSchema, successResponseSchema } from '@/schemas';
import { baseResponseSchema, combinedResponseSchema } from '@/schemas';
import { z } from 'zod';

export declare type BaseResponse = z.infer<typeof baseResponseSchema>;

export declare type ErrorResponse = z.infer<typeof errorResponseSchema>;

export declare type SuccessResponse = z.infer<typeof successResponseSchema>;

export declare type CombinedResponse = z.infer<typeof combinedResponseSchema>;
