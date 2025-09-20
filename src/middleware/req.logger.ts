import { Request, NextFunction, Response } from 'express';
import { Logger } from '@nestjs/common';

/**
 * Creates a middleware that logs incoming request details for debugging purposes.
 *
 * @example
 * ```typescript
 * // Use the logging middleware in your application
 * app.use(createRequestLoggerMiddleware());
 *
 * // Output:
 * [Nest] 14116  - 07/11/2025, 9:52:12 AM     LOG [2025-07-11T07:52:12.653Z] POST /signup
 * ```
 *
 * @returns {RequestHandler} Express middleware function that logs request details
 */
export const createRequestLoggerMiddleware = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        Logger.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl.length > 100 ? req.originalUrl.slice(0, 100) + '...' : req.originalUrl}`,
        );
        next();
    };
};
