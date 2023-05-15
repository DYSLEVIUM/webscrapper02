import { NextFunction, Request, Response } from 'express';
import { logger } from '../shared/utils/logger';

export default function (req: Request, _res: Response, next: NextFunction) {
    logger.info(`Request for ${req.method} to route ${req.originalUrl}.`);
    next();
}
