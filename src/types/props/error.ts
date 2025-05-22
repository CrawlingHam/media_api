import { Operation } from '@/types/models';
import { Response } from 'express';

export type ErrorServiceProps<T> = {
    validateSuccess?: boolean;
    operation: Operation;
    fn: () => Promise<T>;
    context: string;
    res?: Response;
};
