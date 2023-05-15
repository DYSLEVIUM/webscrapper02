import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { expressErrorHandler } from './middlewares';
import { attachRoutes } from './routes';
import { Environment } from './shared/constants/environments';
import { ExpressServer, WSServer } from './shared/constants/logs';
import {
    ExpressServerStartError,
    RouteNotFoundError,
} from './shared/errors/express';
import { WSServerStartError } from './shared/errors/ws';
import { accessEnv } from './shared/utils/accessEnv';
import { logger } from './shared/utils/logger';

const startExpressServer = async () => {
    try {
        const PORT = parseInt(accessEnv(Environment.API_PORT, '3000'), 10);
        const app = express();

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors({ origin: (_, cb) => cb(null, true), credentials: true }));

        attachRoutes(app);

        app.use((req: Request, _res: Response, next: NextFunction) =>
            next(new RouteNotFoundError(req.originalUrl))
        );

        app.use(expressErrorHandler);

        const server = http.createServer(app);
        return server.listen(PORT, '0.0.0.0', () => {
            logger.info(ExpressServer.SUCCESSFUL_START);
            logger.info(`Express Server running on PORT ${PORT}.`);
        });
    } catch (err) {
        throw new ExpressServerStartError(err);
    }
};

const startWSServer = async (server: http.Server) => {
    try {
        const io = new Server(server);
        io.on('connection', (socket) => {
            //TODO: setup later
            console.log(socket);
            console.log('a user connected');
        });
        logger.info(WSServer.SUCCESSFUL_START);
        return io;
    } catch (err) {
        throw new WSServerStartError(err);
    }
};

const main = async () => {
    try {
        // const app = await startExpressServer();
        // await startWSServer(app);
        // const scrapperManager = new ScrapperManager();
        // scrapperManager.addScrapper('Gpu Scrapper', 'nvidia gpu 3060', 3000);
        // console.log(await scrapperManager.startAllScrappers());
        // console.log(await scrapperManager.stopAllScrappers());
        fetch(
            `http://scrapper:${accessEnv(
                Environment.BOT_PORT,
                '5000'
            )}/start_scrapper`,
            {
                method: 'POST',
                body: JSON.stringify({
                    target_price: 100,
                    keywords: 'water bottle',
                }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        ).then((data) => {
            console.log(data);
        });
    } catch (err) {
        logger.error(err);
    }

    // const runCommand = `docker-compose --env-file=../envs/.env.dev -f ../docker/docker-compose.yaml -f ../docker/docker-compose.dev.yaml run scrapper`;
    // try {
    //     execSync(runCommand, { stdio: 'inherit' });
    //     console.log('Container started successfully.');
    // } catch (error) {
    //     console.error('Error occurred while starting container.', error);
    // }
};

main();
