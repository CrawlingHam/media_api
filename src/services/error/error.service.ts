import { BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Injectable, Logger, HttpStatus, InternalServerErrorException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Response } from 'express';

@Injectable()
export class ErrorService {
    private logger: Logger;
    private context: string;

    constructor() {
        this.context = '';
        this.logger = new Logger(this.context);
    }

    public setContext(context: string): void {
        this.context = context;
        this.logger = new Logger(this.context);
    }

    /**
     * Wraps a function in a try-catch block with standardized error handling
     * Optionally sends the response to the client
     */
    public async execute<T>(operation: string, fn: () => Promise<T>, res?: Response): Promise<T> {
        try {
            const result = await fn();
            if (res) res.status(HttpStatus.OK).json(result);
            return result;
        } catch (error: AxiosError | Error | unknown) {
            const httpError = this.handle(error, operation);
            if (res) {
                res.status(httpError.getStatus()).json({
                    message: httpError.message,
                    suggestions: ['Try again later', 'Contact support if the issue persists'],
                });
            }
            throw httpError;
        }
    }

    /**
     * Internal error handling logic for different error types
     */
    private handle(error: AxiosError | Error | unknown, operation: string): HttpException {
        if (error instanceof HttpException) return error;

        if (error instanceof AxiosError && error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.message || `API request failed with status ${status}`;

            this.logger.error(`❌ Failed to ${operation}: ${status} - ${errorMessage}`);

            // Handle status codes with appropriate exceptions
            switch (status) {
                case HttpStatus.BAD_REQUEST:
                    return new BadRequestException(errorMessage);
                case HttpStatus.UNAUTHORIZED:
                    return new UnauthorizedException(errorMessage);
                case HttpStatus.FORBIDDEN:
                    return new ForbiddenException(errorMessage);
                case HttpStatus.NOT_FOUND:
                    return new NotFoundException(errorMessage);
                case HttpStatus.INTERNAL_SERVER_ERROR:
                case HttpStatus.NOT_IMPLEMENTED:
                case HttpStatus.BAD_GATEWAY:
                case HttpStatus.SERVICE_UNAVAILABLE:
                case HttpStatus.GATEWAY_TIMEOUT:
                    return new InternalServerErrorException(errorMessage);
                default:
                    return new HttpException(errorMessage, status);
            }
        }

        const errorMessage =
            error instanceof Error ? error.message : `An unexpected error occurred during ${operation}`;

        this.logger.error(`❌ Error in ${operation}: ${errorMessage}`);
        return new InternalServerErrorException(errorMessage);
    }
}
