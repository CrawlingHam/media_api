import { ControllersModule } from './controllers';
import { ServicesModule } from './services';
import { Module } from '@nestjs/common';

@Module({
    imports: [ServicesModule, ControllersModule],
})
export class AppModule {}
