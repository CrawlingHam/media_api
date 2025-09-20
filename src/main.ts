import { validateEnv } from './models/env';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'production') {
    console.log('🔃 Production environment detected. Skipping .env file');
} else {
    console.log('🔃 Development environment detected. Loading .env file...');
    config();
}

validateEnv();

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './modules';
import { corsConfig } from './models';
import {
    createRequestLoggerMiddleware,
    GlobalExceptionFilter,
} from './middleware';

async function bootstrap(): Promise<void> {
    const logger = new Logger('Bootstrap');

    const serverDomain = process.env.SERVER_DOMAIN!;
    const portMatch = serverDomain.match(/:(\d+)$/);
    const port = portMatch![1];

    const app = await NestFactory.create(AppModule);

    app.enableCors(corsConfig);
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.use(createRequestLoggerMiddleware());

    await app.listen(parseInt(port, 10));
    logger.log(`🚀 Authentication Server running on port ${port}`);
}

void bootstrap();
