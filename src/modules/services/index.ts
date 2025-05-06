import { CloudinaryModule } from './cloudinary';
import { Module } from '@nestjs/common';
import { ErrorModule } from './error';

@Module({
    imports: [CloudinaryModule, ErrorModule],
    exports: [CloudinaryModule, ErrorModule],
})
export class ServicesModule {}
