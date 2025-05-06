import { ErrorService } from '@/services';
import { Module } from '@nestjs/common';

@Module({
    providers: [ErrorService],
    exports: [ErrorService],
})
export class ErrorModule {}
