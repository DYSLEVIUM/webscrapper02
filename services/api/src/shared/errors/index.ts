import { ErrorData } from '../types/errorData';
import { logger } from '../utils/logger';

export class CustomError extends Error {
    constructor(message: string, code: string, public error: unknown) {
        super(message);
        Object.defineProperty(this, 'errors', { value: error as ErrorData });
        logger.error(message, { ...(error as ErrorData), code });
    }
}
