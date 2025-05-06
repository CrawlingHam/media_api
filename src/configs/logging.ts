import { Request, NextFunction, Response } from 'express';
import { Logger } from '@nestjs/common';

/**
 * Creates a middleware that logs incoming request details for debugging purposes.
 *
 * @example
 * ```typescript
 * // Use the logging middleware in your application
 * app.use(createRequestLogger());
 * ```
 *
 * @returns {RequestHandler} Express middleware function that logs request details
 */
export const createRequestLogger = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        Logger.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    };
};
