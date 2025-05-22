import { constructUrl, ensureRequiredEnvironmentVariables, IEnvironmentConfig } from 'flixburst-environment_variables';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

const envConfig: IEnvironmentConfig = {
    location: 'services locations',
    requiredVariables: ['API_AWS_GATEWAY_MEDIA_URL', 'MEDIA_SERVER', 'DOMAIN'],
};

const { DOMAIN, MEDIA_SERVER, API_AWS_GATEWAY_MEDIA_URL } = ensureRequiredEnvironmentVariables(envConfig);

const paths = {
    aws: {
        media: {
            gateway: API_AWS_GATEWAY_MEDIA_URL,
            cloudinary: {
                base: 'cloudinary',
                signature: 'signature',
                upload: {
                    base: 'upload',
                    image: 'image',
                },
            },
        },
    },
    servers: {
        media: {
            base: MEDIA_SERVER,
            controllers: {
                cloudinary: {
                    base: 'cloudinary',
                    upload: {
                        base: 'upload',
                        image: 'image',
                    },
                },
            },
        },
    },
} as const;

const server = {
    port: new URL(paths.servers.media.base).port || 8003,
    controllers: {
        cloudinary: {
            base: paths.servers.media.controllers.cloudinary.base,
            upload: {
                base: paths.servers.media.controllers.cloudinary.upload.base,
                image: `${paths.servers.media.controllers.cloudinary.upload.base}/${paths.servers.media.controllers.cloudinary.upload.image}`,
            },
        },
    },
};

const domain = new URL(DOMAIN);

const apps = {
    domain: domain.toString(),
};

const aws = {
    media: {
        cloudinary: {
            signature: constructUrl(
                paths.aws.media.gateway,
                paths.aws.media.cloudinary.base,
                paths.aws.media.cloudinary.signature
            ).toString(),
            upload: {
                image: constructUrl(
                    paths.aws.media.gateway,
                    paths.aws.media.cloudinary.base,
                    paths.aws.media.cloudinary.upload.base,
                    paths.aws.media.cloudinary.upload.image
                ).toString(),
            },
        },
    },
};

export const services = {
    server,
    apps,
    aws,
};
