import { constructUrl, ensureRequiredEnvironmentVariables, IEnvironmentConfig } from 'flixburst-environment_variables';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

const envConfig: IEnvironmentConfig = {
    location: 'services locations',
    requiredVariables: [
        'API_CLOUDINARY_IMAGE_UPLOAD_URL',
        'API_AWS_GATEWAY_MEDIA_URL',
        'CLOUDINARY_UPLOAD_PRESET',
        'CLOUDINARY_CLOUD_NAME',
        'MEDIA_SERVER',
        'DOMAIN',
    ],
};

const {
    DOMAIN,
    MEDIA_SERVER,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
    API_AWS_GATEWAY_MEDIA_URL,
    API_CLOUDINARY_IMAGE_UPLOAD_URL,
} = ensureRequiredEnvironmentVariables(envConfig);

const paths = {
    aws: {
        media: {
            gateway: API_AWS_GATEWAY_MEDIA_URL,
            cloudinary: {
                base: '/cloudinary',
                signature: '/signature',
            },
        },
    },
    servers: {
        media: {
            base: MEDIA_SERVER,
        },
    },
} as const;

const server = {
    port: new URL(paths.servers.media.base).port || 8003,
    controllers: {
        cloudinary: 'cloudinary',
    },
};

const domain = new URL(DOMAIN);

const apps = {
    domain: domain.toString(),
};

const cloudinary = {
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    upload: constructUrl(
        API_CLOUDINARY_IMAGE_UPLOAD_URL.replace('{CLOUDINARY_CLOUD_NAME}', CLOUDINARY_CLOUD_NAME)
    ).toString(),
};

const aws = {
    media: {
        cloudinary: {
            signature: constructUrl(
                paths.aws.media.gateway,
                paths.aws.media.cloudinary.base,
                paths.aws.media.cloudinary.signature
            ).toString(),
        },
    },
};

export const services = {
    cloudinary,
    server,
    apps,
    aws,
};
