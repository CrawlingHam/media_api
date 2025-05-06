import { CloudinaryController } from '@/controllers';
import { ServicesModule } from '../services';
import { Module } from '@nestjs/common';

@Module({
    imports: [ServicesModule],
    controllers: [CloudinaryController],
})
export class ControllersModule {}
