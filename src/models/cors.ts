import { Logger } from '@nestjs/common';
import { CorsOptions } from 'cors';

const logger = new Logger('CorsModel');

function normalizeOrigin(origin: string): string {
    const trimmed = origin.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    if (trimmed.includes('.') && !trimmed.startsWith('localhost')) {
        return `https://${trimmed}`;
    }

    return trimmed;
}

const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(',').map(normalizeOrigin) || [];

const corsConfig: CorsOptions = {
    allowedHeaders: 'Content-Type, Accept, Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    origin: allowedOrigins,
    credentials: true,
};

logger.log(`✅ Cors configured`);

export { corsConfig };
