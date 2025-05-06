import { CloudinaryUploadServiceProps, ExtractFormDataResult, ICloudinaryUploadService } from '@/types';
import { PostAppendToFormDataProps, UploadImageProps } from '@/types';
import { Injectable, Logger } from '@nestjs/common';
import type { UploadApiResponse } from 'cloudinary';
import { services } from '@/services.locations';
import { ErrorService } from '../error';
import axios from 'axios';

@Injectable()
export class CloudinaryUploadService implements ICloudinaryUploadService {
    private readonly logger = new Logger(CloudinaryUploadService.name);
    private readonly endpoint: string = services.cloudinary.upload;

    constructor(private readonly errorService: ErrorService) {
        this.errorService.setContext(CloudinaryUploadService.name);
    }

    public async upload(props: CloudinaryUploadServiceProps): Promise<string> {
        const { formData, operation, body } = props;
        const startTime = performance.now();

        if (!formData) throw new Error('FormData is required');
        if (!operation) throw new Error('Operation is required');

        const file = formData.get('file') as File;
        this.logger.log(`🚀 Starting ${operation} upload for file: ${file.name}`);

        return await this.errorService.execute('upload', async () => {
            let result: string;
            switch (operation) {
                case 'image':
                    result = await this.uploadImage({ body, formData });
                    break;
                default:
                    throw new Error('Invalid operation');
            }

            const duration = (performance.now() - startTime).toFixed(2);
            this.logger.log(`✅ Upload completed in ${duration}ms`);
            return result;
        });
    }

    /**
     * Handles the specific logic for uploading images to Cloudinary.
     * Prepares form data with required Cloudinary parameters and makes the upload request.
     *
     * @example
     * ```typescript
     * const imageUrl = await uploadImage({
     *   body: "upload_preset=preset&signature=abc&timestamp=123&api_key=xyz",
     *   formData: formDataObject
     * });
     * // Returns: "https://res.cloudinary.com/..."
     * ```
     *
     * @throws {Error} When Cloudinary response is missing URL
     * @returns {Promise<string>} The secure URL of the uploaded image
     */
    private async uploadImage(props: UploadImageProps): Promise<string> {
        const { body, formData } = props;

        const uploadFormData = this.postAppendToFormData({ body, formData });
        this.logger.debug(`📦 Form data prepared with ${uploadFormData.getAll('file').length} files`);

        const response = await axios.post(this.endpoint, uploadFormData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data: UploadApiResponse = response.data;

        if (!data.url) throw new Error('Invalid response from Cloudinary: Missing URL');

        return data.url;
    }

    /**
     * Creates a FormData object with all required Cloudinary upload parameters.
     * Combines the signature data from the Lambda response with the file to upload.
     *
     * @example
     * ```typescript
     * const formData = postAppendToFormData({
     *   body: "upload_preset=preset&signature=abc&timestamp=123&api_key=xyz",
     *   formData: formDataObject
     * });
     * // Returns: FormData with all required fields
     * ```
     *
     * @returns {FormData} FormData object ready for upload
     */
    private postAppendToFormData(props: PostAppendToFormDataProps): FormData {
        const { body, formData } = props;
        const { upload_preset, signature, timestamp, apiKey } = this.extractFormData(body);

        const uploadFormData = new FormData();
        uploadFormData.append('upload_preset', upload_preset);
        uploadFormData.append('signature', signature);
        uploadFormData.append('timestamp', timestamp);
        uploadFormData.append('api_key', apiKey);
        uploadFormData.append('file', formData.get('file') as File);

        return uploadFormData;
    }

    /**
     * Extracts and validates required Cloudinary parameters from the Lambda response.
     * Parses the URLSearchParams string and ensures all required fields are present.
     *
     * @example
     * ```typescript
     * const params = extractFormData("upload_preset=preset&signature=abc&timestamp=123&api_key=xyz");
     * // Returns: { upload_preset: "preset", signature: "abc", timestamp: "123", apiKey: "xyz" }
     * ```
     *
     * @throws {Error} When any required parameter is missing
     * @returns {ExtractFormDataResult} Object containing all required Cloudinary parameters
     */
    private extractFormData(body: string): ExtractFormDataResult {
        const params = new URLSearchParams(body);
        const { upload_preset, signature, timestamp, api_key: apiKey } = Object.fromEntries(params.entries());

        if (!signature || !apiKey || !timestamp || !upload_preset) {
            this.logger.error('❌ Missing required Cloudinary parameters');
            throw new Error('Invalid response from Lambda: Missing required parameters');
        }

        return { upload_preset, signature, timestamp, apiKey };
    }
}
