import { Response } from 'express';
import {
    ExceptionFilter,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Catch,
} from '@nestjs/common';

/**
 * Global exception filter that standardizes error responses.
 *
 * This filter catches all exceptions and returns a consistent response format
 * with only the message field, regardless of the exception type.
 *
 * @example
 * ```typescript
 * // All exceptions will return the same format:
 * // { "message": "Error description" }
 *
 * throw new BadRequestException('Invalid input');
 * throw new ValidationException('Field required');
 * throw new NotFoundException('User not found');
 * ```
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status: number;
        let message: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            // Handle different response formats
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                // Check if it's already in our simplified format
                if (
                    'message' in exceptionResponse &&
                    typeof exceptionResponse.message === 'string'
                ) {
                    message = exceptionResponse.message;
                } else {
                    // Extract message from standard NestJS error format
                    message =
                        'message' in exceptionResponse &&
                        typeof exceptionResponse.message === 'string'
                            ? exceptionResponse.message
                            : 'An error occurred';
                }
            } else {
                message = 'An error occurred';
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message =
                exception instanceof Error
                    ? exception.message
                    : 'Internal server error';
        }

        // Return standardized response format
        response.status(status).json({
            message,
        });
    }
}
