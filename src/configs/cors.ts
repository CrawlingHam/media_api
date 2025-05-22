import { services } from '@/services.locations';
import { CorsOptions } from 'cors';

/**
 * CORS configuration for the API Gateway.
 * Defines allowed origins, headers, methods, and credentials settings.
 *
 * @example
 * ```typescript
 * // Enable CORS in your application
 * app.enableCors(corsConfig);
 * ```
 *
 * @type {CorsOptions}
 */
export const corsConfig: CorsOptions = {
    allowedHeaders: 'Content-Type, Accept, Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    origin: [services.apps.domain, 'http://localhost:5000'],
    credentials: true,
};
