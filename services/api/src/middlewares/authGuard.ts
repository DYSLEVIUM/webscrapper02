import { NextFunction, Request, Response } from 'express';
import { logger } from '../shared/utils/logger';

//TODO: authGuard
export default function (req: Request, _res: Response, next: NextFunction) {
    logger.info(
        `Auth guard invoked for method ${req.method} to route ${req.originalUrl}.`
    );
    next();
}
