import 'module-alias/register';
import { createRequestLogger, corsConfig, validationConfig, HttpExceptionFilter } from '@/configs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { services } from './services.locations';
import { json, urlencoded } from 'body-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/modules';

const MAX_PAYLOAD_SIZE = 10 as const;
export const MAX_PAYLOAD_SIZE_BYTES = MAX_PAYLOAD_SIZE * Math.pow(1024, 2);
const MAX_PAYLOAD_SIZE_STRING = `${MAX_PAYLOAD_SIZE}mb` as const;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    app.enableCors(corsConfig);
    // app.use(json({ limit: MAX_PAYLOAD_SIZE_STRING }));
    // app.use(urlencoded({ extended: true, limit: MAX_PAYLOAD_SIZE_STRING }));
    // app.useGlobalPipes(new ValidationPipe(validationConfig));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(createRequestLogger());

    const port = services.server.port;
    await app.listen(port);

    logger.log(`🚀 Media Server running on port ${port}`);
}

bootstrap();
