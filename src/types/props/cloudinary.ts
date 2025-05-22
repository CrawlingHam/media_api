import { CloudinaryServiceOperation, CloudinaryUploadMetadata } from '../models';
import { Response } from 'express';

export type CloudinaryUploadImageProps = {
    metadata: CloudinaryUploadMetadata;
    file: Express.Multer.File;
};

export type CloudinaryUploadProps = CloudinaryUploadImageProps & {
    operation: Extract<CloudinaryServiceOperation, 'CLOUDINARY UPLOAD IMAGE'>;
    res: Response;
};

export type CloudinaryProps = Omit<CloudinaryUploadProps, 'metadata'>;
