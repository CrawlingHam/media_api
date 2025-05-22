import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class FileValidationPipe implements PipeTransform {
    private readonly logger = new Logger(FileValidationPipe.name);

    transform(value: Express.Multer.File) {
        this.logger.log('🔍 Validating upload request');

        if (!value) {
            this.logger.error('❌ No file found in request');
            throw new BadRequestException('No file uploaded');
        }

        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(value.mimetype)) {
            this.logger.error(
                `❌ Invalid file type: ${value.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
            );
            throw new BadRequestException(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
        }

        // Validate file size
        if (value.size > MAX_FILE_SIZE) {
            this.logger.error(`❌ File too large: ${value.size} bytes. Maximum size: ${MAX_FILE_SIZE} bytes`);
            throw new BadRequestException(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }

        this.logger.log('✅ File validation passed');
        return value;
    }
}
