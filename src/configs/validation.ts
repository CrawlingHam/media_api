import { ValidationPipeOptions, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Validation configuration for the application.
 * Defines how incoming data should be validated and transformed.
 *
 * @example
 * ```typescript
 * // Use validation in your application
 * app.useGlobalPipes(new ValidationPipe(validationConfig));
 * ```
 *
 * @type {ValidationPipeOptions}
 */
export const validationConfig: ValidationPipeOptions = {
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: errors => {
        const messages = errors.map(error => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
        });
        return new HttpException(
            {
                message: messages.join('; '),
                statusCode: HttpStatus.BAD_REQUEST,
            },
            HttpStatus.BAD_REQUEST
        );
    },
};
