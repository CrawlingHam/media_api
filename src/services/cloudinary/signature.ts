import { ICloudinarySignatureService, initialAppendToFormDataProps } from '@/types';
import { CloudinarySignatureProps, CombinedResponse } from '@/types';
import { Injectable, Logger } from '@nestjs/common';
import { combinedResponseSchema } from '@/schemas';
import { services } from '@/services.locations';
import { HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ErrorService } from '../error';

@Injectable()
export class CloudinarySignatureService implements ICloudinarySignatureService {
    private readonly logger = new Logger(CloudinarySignatureService.name);
    private readonly endpoint: string = services.aws.media.cloudinary.signature;
    private readonly uploadPreset: string = services.cloudinary.uploadPreset;

    constructor(private readonly errorService: ErrorService) {
        this.errorService.setContext(CloudinarySignatureService.name);
    }

    public async getSignature(props: CloudinarySignatureProps): Promise<string> {
        const { formData } = props;
        const startTime = performance.now();

        const file = formData.get('file') as File;
        this.logger.log(`🔑 Requesting signature for file: ${file.name}`);

        const formDataString = this.initialAppendToFormData({
            uploadPreset: this.uploadPreset,
            formData,
        });

        return await this.errorService.execute('get signature', async () => {
            const response = await axios.post(this.endpoint, formDataString, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const validatedResponse: CombinedResponse = combinedResponseSchema.parse({
                statusCode: response.status,
                headers: response.headers,
                body: response.data,
            });

            if (validatedResponse.statusCode !== HttpStatus.OK) {
                throw new Error('Unexpected response status code');
            }

            const duration = (performance.now() - startTime).toFixed(2);
            this.logger.log(`✅ Signature received in ${duration}ms`);

            return validatedResponse.body;
        });
    }

    /**
     * Creates the initial form data for the signature request.
     * Prepares the upload preset and filename for the Lambda.
     *
     * @example
     * ```typescript
     * const formData = initialAppendToFormData({
     *   uploadPreset: "my_preset",
     *   formData: formDataObject
     * });
     * // Returns: "upload_preset=my_preset&filename=image.jpg"
     * ```
     *
     * @returns {string} URLSearchParams string with upload preset and filename
     */
    private initialAppendToFormData(props: initialAppendToFormDataProps): string {
        const { uploadPreset, formData } = props;
        const file = formData.get('file') as File;

        const params = new URLSearchParams();
        params.append('upload_preset', uploadPreset);
        params.append('filename', file.name);

        this.logger.debug(`📝 Prepared form data for ${file.name} with preset: ${uploadPreset}`);

        return params.toString();
    }
}
