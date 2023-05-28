import { Express, Response, Router } from 'express';
import { authGuard, routeLog } from '../middlewares';
import { APIResponse } from '../shared/interfaces';
import { default as scriptManagerRouter } from './scriptManager';

const attachPublicRoutes = (router: Router) => {
    router.get('/', (_req, res: Response<APIResponse>) => {
        res.status(200).send({
            message: 'Welcome to the API.',
            data: null,
            error: null,
        });
    });

    return router;
};

const attachPrivateRoutes = (router: Router) => {
    router.use('/scriptManager', authGuard, scriptManagerRouter);
    return router;
};

export const attachRoutes = (app: Express) => {
    const router = Router();
    attachPublicRoutes(router);
    attachPrivateRoutes(router);
    app.use('/api', routeLog, router);
};
