import { Logger } from '@nestjs/common';
import { getSecret } from 'src/utils';

const logger = new Logger('CloudinaryModel');

const cloudinaryCredentials = getSecret(
    process.env.CLOUDINARY_CREDENTIALS_PATH,
    '../../secrets/cloudinary/credentials.json',
    logger,
    'cloudinary credentials',
) as Record<string, string>;

export { cloudinaryCredentials };
