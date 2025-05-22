import { BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Injectable, Logger, HttpStatus, InternalServerErrorException, HttpException } from '@nestjs/common';
import { MediaResponse, ErrorServiceProps, Operation } from '@/types';
import { OperationStatus, ServiceOperation } from '@/types';
import { CloudinarySchema } from '@/schemas';
import { AxiosError } from 'axios';
import { ZodError } from 'zod';

@Injectable()
export class ErrorService {
    private logger: Logger = new Logger(ErrorService.name);
    private recentResponses: Map<string, unknown> = new Map();
    private recentErrors: Map<string, Error> = new Map();
    private status: OperationStatus = 'inconclusive';
    private readonly maxErrorDepth: number = 3;
    private startTime: number = 0;

    /**
     * Sets the context for the logger
     * @param context - The context to set for the logger. Set as the name of a class or function to identify the source of the log
     */
    private setContext(context: string): void {
        this.logger = new Logger(context);
    }

    /**
     * Wraps a function in a try-catch block with standardized error handling
     * Optionally sends the response to the client
     */
    public async execute<T>(props: ErrorServiceProps<T>): Promise<T> {
        const { operation, fn, res, validateSuccess = false, context } = props;
        this.setContext(context);

        this.startTime = performance.now();

        try {
            this.logger.log(`🔍 Executing ${operation} operation`);

            let result = await fn();

            if (validateSuccess && this.isServiceOperation(operation)) {
                // Only validate if it's a Cloudinary operation and hasn't been validated yet
                if (operation.includes('CLOUDINARY')) {
                    this.logger.log(`✅ Validating response for ${operation}`);
                    result = CloudinarySchema.parse({
                        data: result,
                        operation,
                    });

                    this.logger.log(`✅ Response validated for ${operation}`);
                }

                if (this.isResponse(result) && result.statusCode !== HttpStatus.OK) {
                    this.status = 'error';
                    const errorBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
                    const errorMessage =
                        errorBody.message || `Operation ${operation} failed with status ${result.statusCode}`;
                    const error = new HttpException(result, result.statusCode);
                    error.message = errorMessage;
                    this.logError(error, operation, result.statusCode);
                    throw error;
                }
            }

            // Check if response has already been processed
            if (this.isRecentlyProcessedResponse(operation)) {
                this.logger.log(`✅ Response already processed for ${operation}`);
                return result;
            }

            if (res && this.isResponse(result)) {
                res.status(result.statusCode).json(result);
                this.addToRecentResponses(result, operation);
            } else if (res) {
                res.status(HttpStatus.OK).json(result);
                this.addToRecentResponses(result, operation);
            }

            this.status = 'success';
            this.logger.log(`✅ ${operation} completed in ${(performance.now() - this.startTime).toFixed(2)}ms`);
            return result;
        } catch (error: AxiosError | ZodError | Error | unknown) {
            this.status = 'error';

            // HttpException means it's already been processed. Reject it
            if (error instanceof HttpException) return Promise.reject(error);

            // If recently processed. Reject
            if (error instanceof Error && this.isRecentlyProcessed(error, operation)) return Promise.reject(error);

            // Handle unprocessed errors
            const processedError = this.handle(error, operation);

            // Add to recent errors
            if (processedError instanceof HttpException) this.addToRecentErrors(processedError, operation);

            throw processedError;
        }
    }

    private isGuardOperation(operation: string): boolean {
        return operation.toUpperCase().includes('GUARD');
    }

    private isServiceOperation(operation: Operation): operation is ServiceOperation {
        return !this.isGuardOperation(operation);
    }

    private isResponse(value: unknown): value is MediaResponse {
        return (
            typeof value === 'object' &&
            value !== null &&
            'statusCode' in value &&
            'body' in value &&
            typeof value.statusCode === 'number'
        );
    }

    private handleZodError(error: ZodError, operation: string): BadRequestException {
        const errorMessage = error.errors[0]?.message || `Invalid data format for ${operation}`;
        const processedError = new Error(errorMessage);
        this.logError(processedError, operation);
        return new BadRequestException({
            message: errorMessage,
        });
    }

    public ZodError(error: ZodError | Error | unknown): {
        message: string;
        statusCode: number;
    } {
        let message = 'Unknown error';

        if (error instanceof ZodError) {
            const firstError = error.errors[0];
            message = firstError.message;
        } else {
            message = `Invalid response body: ${error instanceof Error ? error.message : message}`;
        }

        return {
            message,
            statusCode: HttpStatus.BAD_REQUEST,
        };
    }

    private handleAxiosError(error: AxiosError | unknown, operation: string): HttpException {
        if (!(error instanceof AxiosError && error.response)) throw error;

        const status = error.response.status;
        let errorMessage = error.response.data?.message || `API request failed with status ${status}`;

        if (typeof error.response.data === 'string') {
            try {
                // Handle possible binary data in the message
                const messageMatch = error.response.data.match(/"message":\s*"([^"]+)"/);
                if (messageMatch && messageMatch[1]) {
                    errorMessage = messageMatch[1];
                }
            } catch (parseError) {
                this.logger.error(`Failed to parse error message: ${parseError}`);
            }
        }

        const processedError = new Error(errorMessage);
        this.logError(processedError, operation, status);

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
            case HttpStatus.SERVICE_UNAVAILABLE:
            case HttpStatus.GATEWAY_TIMEOUT:
            case HttpStatus.NOT_IMPLEMENTED:
            case HttpStatus.BAD_GATEWAY:
                return new InternalServerErrorException(errorMessage);
            default:
                return new HttpException(errorMessage, status);
        }
    }

    private handle(error: AxiosError | ZodError | Error | unknown, operation: string): HttpException {
        if (error instanceof HttpException) return error;
        if (error instanceof ZodError) return this.handleZodError(error, operation);
        if (error instanceof AxiosError) return this.handleAxiosError(error, operation);

        const errorMessage =
            error instanceof Error ? error.message : `An unexpected error occurred during ${operation}`;
        const processedError = new Error(errorMessage);
        this.logError(processedError, operation);
        return new InternalServerErrorException(errorMessage);
    }

    /**
     * Generates a unique key for an error
     */
    private getErrorKey(error: Error, operation: string): string {
        return `${operation}:${error.constructor.name}:${error.message}`;
    }

    /**
     * Checks if an error has been recently processed
     */
    private isRecentlyProcessed(error: Error, operation: string): boolean {
        const key = this.getErrorKey(error, operation);
        return this.recentErrors.has(key);
    }

    /**
     * Adds an error to the recent errors map
     */
    private addToRecentErrors(error: Error, operation: string): void {
        const key = this.getErrorKey(error, operation);
        this.recentErrors.set(key, error);

        // Maintain max size
        if (this.recentErrors.size > this.maxErrorDepth) {
            const firstKey = this.recentErrors.keys().next().value;
            if (firstKey) this.recentErrors.delete(firstKey);
        }
    }

    /**
     * Centralized error logging
     */
    private logError(error: Error | unknown, operation: string, status?: number): void {
        const statusInfo = status ? `: ${status}` : '';
        this.logger.error(
            `❌ Failed to ${operation}${statusInfo} - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }

    private getResponseKey(operation: string): string {
        return `${operation}:response`;
    }

    private isRecentlyProcessedResponse(operation: string): boolean {
        const key = this.getResponseKey(operation);
        return this.recentResponses.has(key);
    }

    private addToRecentResponses<T>(result: T, operation: string): void {
        const key = this.getResponseKey(operation);
        this.recentResponses.set(key, result);

        // Maintain max size
        if (this.recentResponses.size > this.maxErrorDepth) {
            const firstKey = this.recentResponses.keys().next().value;
            if (firstKey) this.recentResponses.delete(firstKey);
        }
    }
}
