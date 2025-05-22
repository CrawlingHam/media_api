import { ParseProps, ServiceOperation } from '@/types';
import { BaseSchema } from '../base';
import { z } from 'zod';

export class CloudinarySchema extends BaseSchema {
    private static readonly serviceOperation = z.enum(['CLOUDINARY UPLOAD IMAGE', 'CLOUDINARY GENERATE SIGNATURE']);
    private static readonly urlEncodedString = z.string().regex(/^[a-zA-Z0-9=&_]+$/);

    private static readonly operation = z.enum([...this.serviceOperation.options]);

    private static readonly cloudinaryUploadMetadata = z.object({
        upload_preset: z.string({
            required_error: 'Upload preset is required for Cloudinary upload',
            invalid_type_error: 'Upload preset must be a string',
        }),
        timestamp: z.string({
            required_error: 'Timestamp is required for Cloudinary upload',
            invalid_type_error: 'Timestamp must be a string',
        }),
        signature: z.string({
            required_error: 'Signature is required for Cloudinary upload',
            invalid_type_error: 'Signature must be a string',
        }),
        api_key: z.string({
            required_error: 'API key is required for Cloudinary upload',
            invalid_type_error: 'API key must be a string',
        }),
    });

    private static readonly generateSignatureResponse = this.successResponse.extend({
        body: this.cloudinaryUploadMetadata,
        headers: z.object({
            'Content-Type': z.literal('application/x-www-form-urlencoded', {
                errorMap: () => ({ message: 'Signature response must be form-encoded' }),
            }),
        }),
    });

    private static readonly uploadImageResponse = this.baseSuccessResponse.extend({
        body: z.object({
            ...this.responseBody.shape,
            url: z.string(),
        }),
        headers: z.object({
            'Content-Type': z.literal('application/json'),
        }),
    });

    private static createMethodSchema(operation: ServiceOperation) {
        switch (operation) {
            case 'CLOUDINARY GENERATE SIGNATURE':
                return CloudinarySchema.createParse({
                    success: CloudinarySchema.generateSignatureResponse,
                    error: CloudinarySchema.errorResponse,
                });
            case 'CLOUDINARY UPLOAD IMAGE':
                return CloudinarySchema.createParse({
                    success: CloudinarySchema.uploadImageResponse,
                    error: CloudinarySchema.errorResponse,
                });
            default:
                throw new Error('Invalid method');
        }
    }

    /**
     * Parses and validates a response for a specific authentication service operation.
     * Validates the response data against the appropriate schema for the operation.
     *
     * @example
     * ```typescript
     * // Parse a login response
     * const response = await axios.post('/auth/login', credentials);
     * const zResponse = AuthenticationSchema.Email.parse({
     *   operation: 'LOGIN',
     *   data: response
     * });
     *
     * // Parse a register response
     * const response = await axios.post('/auth/register', userData);
     * const zResponse = AuthenticationSchema.Email.parse({
     *   operation: 'REGISTER',
     *   data: response
     * });
     * ```
     */
    public static parse<T>({ operation, data }: ParseProps<T>) {
        return this.parser({ operation, data, createMethodSchema: this.createMethodSchema });
    }
}
