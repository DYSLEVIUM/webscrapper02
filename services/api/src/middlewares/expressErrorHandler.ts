import { ErrorRequestHandler } from 'express';
import { ExpressError } from '../shared/errors/express';
import { WSError } from '../shared/errors/ws';
import { logger } from '../shared/utils/logger';

export const expressErrorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
) => {
    const isErrorSafe = err instanceof ExpressError || err instanceof WSError;

    const clientError: ExpressError = isErrorSafe
        ? err
        : new ExpressError('Something went wrong', {}, 'INTERNAL_ERROR', 500);

    if (!isErrorSafe) logger.error(err);

    return res
        .status(clientError.statusCode || 500)
        .send({ message: 'Error Occurred.', data: 0, error: clientError });
};

export default expressErrorHandler;
