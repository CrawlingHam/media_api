import { CloudinarySchema } from '@/schemas';
import { ErrorResponse } from './shared';
import { z } from 'zod';

export type CloudinaryServiceOperation = z.infer<(typeof CloudinarySchema)['serviceOperation']>;
export type CloudinaryOperation = z.infer<(typeof CloudinarySchema)['operation']>;

export type CloudinaryGenerateSignatureResponse = z.infer<(typeof CloudinarySchema)['generateSignatureResponse']>;
export type CloudinaryUploadImageResponse = z.infer<(typeof CloudinarySchema)['uploadImageResponse']>;

export type CloudinaryUploadResponse = CloudinaryUploadImageResponse;

export type CloudinarySuccessResponse = CloudinaryUploadImageResponse | CloudinaryGenerateSignatureResponse;

export type CloudinaryResponse = (CloudinarySuccessResponse | ErrorResponse) & {
    service: CloudinaryServiceOperation;
};

export type CloudinaryUploadMetadata = z.infer<(typeof CloudinarySchema)['cloudinaryUploadMetadata']>;
