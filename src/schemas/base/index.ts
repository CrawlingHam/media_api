import { CreateParseOptions, ParserProps } from '@/types';
import { HttpStatus } from '@nestjs/common';
import { z } from 'zod';

export class BaseSchema {
    private static readonly status = z.enum(['success', 'error', 'inconclusive']);

    protected static readonly responseBody = z.object({
        message: z.string(),
    });

    protected static readonly response = z.object({
        headers: z.record(z.string()).optional(),
        statusCode: z.number(),
        body: z.unknown(),
    });

    protected static readonly errorResponseBody = this.responseBody.extend({
        suggestions: z.array(z.string()).optional(),
    });

    protected static readonly errorResponse = z.object({
        statusCode: z.union([
            z.literal(HttpStatus.INTERNAL_SERVER_ERROR),
            z.literal(HttpStatus.UNAUTHORIZED),
            z.literal(HttpStatus.BAD_REQUEST),
            z.literal(HttpStatus.FORBIDDEN),
            z.literal(HttpStatus.NOT_FOUND),
        ]),
        body: this.errorResponseBody,
    });

    protected static readonly successResponse = z.object({
        statusCode: z.literal(HttpStatus.OK),
    });

    protected static readonly baseSuccessResponse = this.successResponse.extend({
        body: this.responseBody,
    });

    protected static createParse<Success extends z.ZodType, Error extends z.ZodType>({
        success,
        error,
    }: CreateParseOptions<Success, Error>) {
        return this.response.transform((data, _) => {
            const parsedData = {
                ...data,
                body: this.parseBody(data),
            };

            if (parsedData.statusCode === HttpStatus.OK || parsedData.statusCode === HttpStatus.CREATED) {
                return success.parse(parsedData);
            } else {
                return error.parse(parsedData);
            }
        });
    }

    protected static parser<T>({ operation, data, createMethodSchema }: ParserProps<T>) {
        const schema = createMethodSchema(operation);
        return schema.parse(data);
    }

    private static parseUrlEncodedBody(body: string): Record<string, string> {
        let result: Record<string, string> = {};
        const params = new URLSearchParams(body);

        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    private static parseBody(response: z.infer<typeof this.response>) {
        if (typeof response.body !== 'string') {
            return response.body;
        }

        const headers = response.headers;
        if (!headers || headers['Content-Type'] !== 'application/x-www-form-urlencoded') {
            return JSON.parse(response.body);
        }

        return this.parseUrlEncodedBody(response.body);
    }
}
