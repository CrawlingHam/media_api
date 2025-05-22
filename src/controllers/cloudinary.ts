import { ApiConsumes, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { UseInterceptors, UploadedFile, HttpStatus } from '@nestjs/common';
import { CloudinaryService, ErrorService } from '@/services';
import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Post, Res } from '@nestjs/common';
import { CloudinaryServiceOperation } from '@/types';
import { services } from '@/services.locations';
import { FileValidationPipe } from '@/pipes';
import { memoryStorage } from 'multer';
import { Response } from 'express';

@Controller(services.server.controllers.cloudinary.base)
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly errorService: ErrorService
    ) {}

    @ApiUnprocessableEntityResponse({ description: HttpStatus.UNPROCESSABLE_ENTITY.toString() })
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    @Post(services.server.controllers.cloudinary.upload.image)
    @ApiConsumes('multipart/form-data')
    async uploadImage(
        @UploadedFile(FileValidationPipe)
        file: Express.Multer.File,
        @Res() res: Response
    ) {
        const operation: CloudinaryServiceOperation = 'CLOUDINARY UPLOAD IMAGE';

        return await this.errorService.execute<void>({
            fn: async (): Promise<void> => {
                await this.cloudinaryService.execute({
                    operation,
                    file,
                    res,
                });
            },
            context: CloudinaryController.name,
            operation,
            res,
        });
    }
}
