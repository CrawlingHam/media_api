import { CloudinaryService, CloudinarySignatureService, CloudinaryUploadService } from '@/services';
import { Module } from '@nestjs/common';
import { ErrorModule } from '../error';

@Module({
    imports: [ErrorModule],
    providers: [CloudinaryService, CloudinarySignatureService, CloudinaryUploadService],
    exports: [CloudinaryService, CloudinarySignatureService, CloudinaryUploadService],
})
export class CloudinaryModule {}
