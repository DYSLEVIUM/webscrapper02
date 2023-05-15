import { CustomError } from '.';
import { Scrapper } from '../constants/logs';

export class ScrapperError extends CustomError {
    constructor(
        public message: string,
        public error: unknown = {},
        public status: string = 'INTERNAL_ERROR',
        public statusCode: number = 500
    ) {
        super(message, status, error);
    }
}

export class ScrapperNotFoundError extends ScrapperError {
    constructor(error: unknown) {
        super(Scrapper.NOT_FOUND, error, 'SCRAPPER_NOT_FOUND', 404);
    }
}

export class ScrapperStartError extends ScrapperError {
    constructor(error: unknown) {
        super(Scrapper.ERROR_START, error, 'SCRAPPER_START_ERROR', 500);
    }
}

export class ScrapperStopError extends ScrapperError {
    constructor(error: unknown) {
        super(Scrapper.ERROR_STOP, error, 'SCRAPPER_STOP_ERROR', 500);
    }
}
