import { ErrorRequestHandler, Response } from 'express';
import { ExpressError } from '../shared/errors/express';
import { ScriptError } from '../shared/errors/script';
import { WSError } from '../shared/errors/ws';
import { APIResponse } from '../shared/interfaces';
import { logger } from '../shared/utils/logger';

export const expressErrorHandler: ErrorRequestHandler = (
    err,
    _req,
    res: Response<APIResponse>,
    _next
) => {
    const isErrorSafe =
        err instanceof ExpressError ||
        err instanceof WSError ||
        err instanceof ScriptError;

    const clientError: ExpressError = isErrorSafe
        ? err
        : new ExpressError('Something went wrong', {}, 'INTERNAL_ERROR', 500);

    if (!isErrorSafe) logger.error('Unsafe error occurred: ', err);

    return res
        .status(clientError.statusCode || 500)
        .send({ message: 'Error Occurred.', data: null, error: clientError });
};

export default expressErrorHandler;
