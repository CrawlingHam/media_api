import { CloudinaryModule } from './cloudinary';
import { Module } from '@nestjs/common';

@Module({
    imports: [CloudinaryModule],
    exports: [CloudinaryModule],
})
export class ServicesModule {}
