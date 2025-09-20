import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { cloudinaryCredentials } from 'src/models';
import axios, { AxiosError } from 'axios';
import { createHash } from 'crypto';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger('CloudinaryService');
    constructor() {}

    public async upload(file: Express.Multer.File): Promise<string> {
        const timestamp = Math.round(Date.now() / 1000);
        const signature = this.generateSignature(timestamp);

        return this.uploadImage(signature, timestamp, file);
    }

    private async uploadImage(
        signature: string,
        timestamp: number,
        file: Express.Multer.File,
    ): Promise<string> {
        this.logger.log('📤 Uploading image');

        const base64File = Buffer.from(file.buffer).toString('base64');
        const fileData = `data:${file.mimetype};base64,${base64File}`;

        const { upload_preset, api_key, cloud_name } = cloudinaryCredentials;
        const metadata = {
            timestamp: timestamp.toString(),
            file: fileData,
            upload_preset,
            signature,
            api_key,
        };

        const formData = this.prepareFormData(metadata);
        const endpoint = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;

        try {
            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const url = response.data.secure_url;

            if (!url) {
                throw new BadRequestException(
                    'Missing "secure_url" from Cloudinary',
                );
            }

            this.logger.log('✅ Image uploaded successfully');

            return url;
        } catch (error: unknown) {
            const msg =
                error instanceof AxiosError
                    ? error.response?.data?.error?.message
                    : error instanceof Error
                      ? error.message
                      : 'unknown error';
            this.logger.error(`❌ Error uploading image: ${msg}`);
            throw new BadRequestException(
                'Failed to upload image. Please try again later',
            );
        }
    }

    private generateSignature(timestamp: number): string {
        this.logger.log('⚙️ Generating signature');

        const { upload_preset, api_secret } = cloudinaryCredentials;
        const str = `timestamp=${timestamp}&upload_preset=${upload_preset}${api_secret}`;
        const signature = createHash('sha1').update(str).digest('hex');

        this.logger.log(`✅ Signature generated`);
        return signature;
    }

    private prepareFormData(metadata: Record<string, string>): FormData {
        const formData = new FormData();

        Object.entries(metadata).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        return formData;
    }
}
