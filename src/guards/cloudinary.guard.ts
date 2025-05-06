import { CanActivate, ExecutionContext, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CloudinaryUploadServiceOperation, CloudinaryExecution } from '@/types';

@Injectable()
export class CloudinaryUploadGuard implements CanActivate {
    private readonly logger = new Logger(CloudinaryUploadGuard.name);
    private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    canActivate(context: ExecutionContext): boolean {
        this.logger.log('🛡️ Initiating Cloudinary Upload Guard');

        const request = context.switchToHttp().getRequest();
        const contentType = request.headers['content-type'];
        const formData = request.body;

        if (!contentType?.includes('multipart/form-data')) {
            this.logger.error('❌ Invalid content type: ' + contentType);
            throw new BadRequestException('Request must be multipart/form-data');
        }

        if (!formData || !(formData instanceof FormData)) {
            this.logger.error('❌ Invalid form data structure');
            throw new BadRequestException('Invalid form data');
        }

        const file = formData.get('file') as File;
        if (!file) {
            this.logger.error('❌ No file found in form data');
            throw new BadRequestException('No file uploaded');
        }

        if (!this.allowedMimeTypes.includes(file.type)) {
            this.logger.error(`❌ Invalid file type: ${file.type}. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
            throw new BadRequestException(`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }

        const operation = formData.get('operation') as CloudinaryUploadServiceOperation;
        if (operation !== 'image') {
            this.logger.error('❌ Invalid operation: ' + operation);
            throw new BadRequestException('Invalid operation. Must be "image"');
        }

        const execution = formData.get('execution') as CloudinaryExecution;
        if (execution !== 'upload') {
            this.logger.error('❌ Invalid execution: ' + execution);
            throw new BadRequestException('Invalid execution. Must be "upload"');
        }

        this.logger.log('🔒 Cloudinary Upload Guard granted access to the Cloudinary Upload Controller');
        return true;
    }
}
