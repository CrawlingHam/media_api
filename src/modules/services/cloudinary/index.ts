import { CloudinaryService, CloudinaryUploadService } from '@/services';
import { Module } from '@nestjs/common';
import { ErrorModule } from '../error';

@Module({
    imports: [ErrorModule],
    providers: [CloudinaryService, CloudinaryUploadService],
    exports: [CloudinaryService, CloudinaryUploadService],
})
export class CloudinaryModule {}
