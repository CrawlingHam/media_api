import { CloudinaryExecuteProps, CloudinaryUploadProps } from '@/types';
import { CloudinarySignatureService } from './signature';
import { CloudinaryUploadService } from './upload';
import { Injectable } from '@nestjs/common';
import { ErrorService } from '../error';

@Injectable()
export class CloudinaryService {
    constructor(
        private readonly signatureService: CloudinarySignatureService,
        private readonly uploadService: CloudinaryUploadService,
        private readonly errorService: ErrorService
    ) {
        this.errorService.setContext(CloudinaryService.name);
    }

    public async execute(props: CloudinaryExecuteProps): Promise<void> {
        const { formData, execution, operation, res } = props;

        switch (execution) {
            case 'upload':
                await this.upload({ formData, operation, res });
                break;
            default:
                throw new Error('Invalid execution');
        }
    }

    private async upload(props: CloudinaryUploadProps): Promise<void> {
        const { formData, operation, res } = props;

        await this.errorService.execute(
            'upload',
            async () => {
                const body = await this.signatureService.getSignature({ formData });
                const url = await this.uploadService.upload({ formData, operation, body });
                return { url };
            },
            res
        );
    }
}
