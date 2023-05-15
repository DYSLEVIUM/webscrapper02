import { CustomError } from '.';
import { WSServer } from '../constants/logs';

export class WSError extends CustomError {
    constructor(
        public message: string,
        public error: unknown = {},
        public status: string = 'INTERNAL_ERROR',
        public statusCode: number = 500
    ) {
        super(message, status, error);
    }
}

export class WSServerStartError extends WSError {
    constructor(error: unknown) {
        super(WSServer.ERROR_START, error, 'SERVER_STARTING_ERROR', 500);
    }
}
