import { CustomError } from '.';
import { ExpressServer } from '../constants/logs';

export class ExpressError extends CustomError {
    constructor(
        public message: string,
        public error: unknown = {},
        public status: string = 'INTERNAL_ERROR',
        public statusCode: number = 500
    ) {
        super(message, status, error);
    }
}

export class ExpressServerStartError extends ExpressError {
    constructor(error: unknown) {
        super(ExpressServer.ERROR_START, error, 'SERVER_STARTING_ERROR', 500);
    }
}

export class RouteNotFoundError extends ExpressError {
    constructor(originalUrl: string) {
        super(
            `Route '${originalUrl}' does not exist.`,
            {},
            'ROUTE_NOT_FOUND',
            404
        );
    }
}
