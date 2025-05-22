import { CloudinaryResponse, CloudinaryUploadImageProps, CloudinaryUploadImageResponse } from '@/types';
import { CloudinaryUploadProps, CloudinaryUploadResponse } from '@/types';
import { Injectable, Logger } from '@nestjs/common';
import { services } from '@/services.locations';
import { ErrorService } from '../error';
import axios from 'axios';

@Injectable()
export class CloudinaryUploadService {
    private readonly imageEndpoint = services.aws.media.cloudinary.upload.image;
    private logger = new Logger(CloudinaryUploadService.name);

    constructor(private readonly errorService: ErrorService) {}

    public async execute(props: CloudinaryUploadProps): Promise<CloudinaryResponse> {
        const { operation, file, res, metadata } = props;

        return await this.errorService.execute<CloudinaryResponse>({
            fn: async () => {
                let response: CloudinaryUploadResponse;

                switch (operation) {
                    case 'CLOUDINARY UPLOAD IMAGE':
                        response = await this.image({ file, metadata });
                        break;
                    default:
                        throw new Error('Invalid execution');
                }

                return {
                    service: operation,
                    ...response,
                };
            },
            context: CloudinaryUploadService.name,
            operation: 'CLOUDINARY UPLOAD IMAGE',
            res,
        });
    }

    private async image(props: CloudinaryUploadImageProps): Promise<CloudinaryUploadImageResponse> {
        this.logger.log('📤 Uploading image to cloudinary');

        const { file, metadata } = props;

        return await this.errorService.execute<CloudinaryUploadImageResponse>({
            fn: async () => {
                const base64File = Buffer.from(file.buffer).toString('base64');
                const fileData = `data:${file.mimetype};base64,${base64File}`;

                // Prepare metadata with file data
                const uploadMetadata = {
                    ...metadata,
                    file: fileData,
                    content_type: file.mimetype,
                };

                const formData = this.prepareFormData(uploadMetadata);

                const response = await axios.post(this.imageEndpoint, formData.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const data = {
                    headers: {
                        'Content-Type': response.headers['Content-Type']! ?? response.headers['content-type']!,
                    },
                    statusCode: response.status,
                    body: response.data,
                };

                return data as CloudinaryUploadImageResponse;
            },
            context: CloudinaryUploadService.name,
            operation: 'CLOUDINARY UPLOAD IMAGE',
            validateSuccess: true,
        });
    }
    private prepareFormData(metadata: Record<string, string>): URLSearchParams {
        const formData = new URLSearchParams();

        Object.entries(metadata).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        return formData;
    }
}
