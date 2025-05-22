import { CloudinaryServiceOperation, CloudinaryResponse } from './cloudinary';
import { BaseSchema } from '@/schemas';
import { z } from 'zod';

export type OperationStatus = z.infer<(typeof BaseSchema)['status']>;

export type ErrorResponse = z.infer<(typeof BaseSchema)['errorResponse']>;

export type MediaResponse = CloudinaryResponse;

export type ServiceOperation = CloudinaryServiceOperation;

export type Operation = ServiceOperation;

export type CreateParseOptions<Success, Error> = {
    success: Success;
    error: Error;
};

export type ParserProps<T> = {
    createMethodSchema: (operation: ServiceOperation) => z.ZodSchema<T>;
    operation: ServiceOperation;
    data: T;
};

export type ParseProps<T> = Omit<ParserProps<T>, 'createMethodSchema'>;
