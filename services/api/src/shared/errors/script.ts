import { CustomError } from '.';
import { Script } from '../constants/logs';

export class ScriptError extends CustomError {
    constructor(
        public message: string,
        public error: unknown = {},
        public status: string = 'INTERNAL_ERROR',
        public statusCode: number = 500
    ) {
        super(message, status, error);
    }
}

export class ScriptNotFoundError extends ScriptError {
    constructor(error: unknown) {
        super(Script.NOT_FOUND, error, 'SCRIPT_NOT_FOUND', 404);
    }
}

export class ScriptStartError extends ScriptError {
    constructor(error: unknown) {
        super(Script.ERROR_START, error, 'SCRIPT_START_ERROR', 500);
    }
}

export class ScriptStopError extends ScriptError {
    constructor(error: unknown) {
        super(Script.ERROR_STOP, error, 'SCRIPT_STOP_ERROR', 500);
    }
}

export class ScriptExecutionError extends ScriptError {
    constructor(error: unknown) {
        super(Script.EXECUTION_STOP, error, 'SCRIPT_EXECUTION_ERROR', 500);
    }
}
