import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { CloudinaryExecuteProps } from '@/types';
import { CloudinaryUploadGuard } from '@/guards';
import { services } from '@/services.locations';
import { ErrorService } from '@/services/error';
import { CloudinaryService } from '@/services';
import { Response } from 'express';

@Controller(services.server.controllers.cloudinary)
export class CloudinaryController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly errorService: ErrorService
    ) {
        this.errorService.setContext(CloudinaryController.name);
    }

    /**
     * Handles file upload requests to Cloudinary CDN.
     * Routes all upload operations through the CloudinaryService class.
     */
    @Post('upload')
    @UseGuards(CloudinaryUploadGuard)
    async upload(@Body() body: CloudinaryExecuteProps, @Res() res: Response) {
        await this.errorService.execute(
            'upload',
            async () => {
                await this.cloudinaryService.execute(body);
            },
            res
        );
    }
}
