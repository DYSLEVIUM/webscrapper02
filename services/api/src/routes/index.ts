import { Express, Router } from 'express';
import { authGuard, routeLog } from '../middlewares';
import { default as scrapperRouter } from './scrapper';

const attachPublicRoutes = (router: Router) => {
    router.get('/', (_req, res) => {
        res.status(200).send({
            message: 'Welcome to the API',
            error: null,
            data: null,
        });
    });

    return router;
};

const attachPrivateRoutes = (router: Router) => {
    router.use('/scrapper', authGuard, scrapperRouter);
    return router;
};

export const attachRoutes = (app: Express) => {
    const router = Router();
    attachPublicRoutes(router);
    attachPrivateRoutes(router);

    app.use('/api', routeLog, router);
};
