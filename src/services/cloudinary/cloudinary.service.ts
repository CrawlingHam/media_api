import { CloudinaryGenerateSignatureResponse, CloudinaryProps, CloudinaryResponse } from '@/types';
import { CloudinaryUploadService } from './upload.service';
import { Injectable, Logger } from '@nestjs/common';
import { services } from '@/services.locations';
import { ErrorService } from '../error';
import axios from 'axios';

@Injectable()
export class CloudinaryService {
    private logger = new Logger(CloudinaryService.name);
    private readonly signatureEndpoint = services.aws.media.cloudinary.signature;

    constructor(
        private readonly uploadService: CloudinaryUploadService,
        private readonly errorService: ErrorService
    ) {}

    public async execute(props: CloudinaryProps): Promise<CloudinaryResponse> {
        const { file, operation, res } = props;

        switch (operation) {
            case 'CLOUDINARY UPLOAD IMAGE':
                const signatureData = await this.signature();
                const metadata = signatureData.body;
                this.logger.log('🔑 Signature metadata retrieved successfully');
                return await this.uploadService.execute({ operation, file, res, metadata });
            default:
                throw new Error('Invalid execution');
        }
    }

    private async signature(): Promise<CloudinaryGenerateSignatureResponse> {
        return await this.errorService.execute<CloudinaryGenerateSignatureResponse>({
            fn: async () => {
                const response = await axios.get(this.signatureEndpoint);
                return response.data;
            },
            operation: 'CLOUDINARY GENERATE SIGNATURE',
            context: CloudinaryService.name,
            validateSuccess: true,
        });
    }
}
