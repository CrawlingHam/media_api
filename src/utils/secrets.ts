import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';

function getSecret(
    secret: string | undefined,
    fallback: string,
    logger: Logger,
    name: string,
): object {
    if (process.env.NODE_ENV !== 'production') {
        logger.log(`🔐 Secret fallback '${name}' loaded`);
        return require(fallback);
    }

    try {
        if (!secret) throw new Error(`❌ Secret '${name}' is not set`);

        const content = readFileSync(secret, 'utf8');
        logger.log(`🔐 Secret '${name}' loaded`);
        return JSON.parse(content);
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`❌ Error reading ${name}: ${errMsg}`);
    }
}

export { getSecret };
