import { ApiConsumes, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessResponseWithData } from 'src/types';
import { CloudinaryService } from 'src/services';
import { FileValidationPipe } from 'src/pipes';
import { memoryStorage } from 'multer';
import {
    UseInterceptors,
    UploadedFile,
    HttpStatus,
    Controller,
    Post,
} from '@nestjs/common';

@Controller('/cloudinary')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}

    @ApiUnprocessableEntityResponse({
        description: HttpStatus.UNPROCESSABLE_ENTITY.toString(),
    })
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    @Post('/upload/image')
    @ApiConsumes('multipart/form-data')
    async uploadImage(
        @UploadedFile(FileValidationPipe)
        file: Express.Multer.File,
    ): Promise<SuccessResponseWithData<string>> {
        const url = await this.cloudinaryService.upload(file);
        return {
            message: 'Image uploaded successfully',
            url,
        };
    }
}
