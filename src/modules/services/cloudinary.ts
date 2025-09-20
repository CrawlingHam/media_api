import { CloudinaryService } from 'src/services';
import { Module } from '@nestjs/common';

@Module({
    providers: [CloudinaryService],
    exports: [CloudinaryService],
})
export class CloudinaryModule {}
