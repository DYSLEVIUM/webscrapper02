import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
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
import { ScriptManager } from './shared/models';
import { accessEnv } from './shared/utils/accessEnv';
import { logger } from './shared/utils/logger';

const startExpressServer = async () => {
    try {
        const PORT = parseInt(accessEnv(Environment.API_PORT, '3000'), 10);
        const app = express();

        app.use(helmet());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(cors({ origin: (_, cb) => cb(null, true), credentials: true }));

        attachRoutes(app);

        app.use((req: Request, _res: Response, next: NextFunction) =>
            next(new RouteNotFoundError(req.originalUrl, req.method))
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
        const io = new Server(server, {
            cors: {
                // origin: '*',
                credentials: true,
            },
            path: '/socket.io',
            transports: ['websocket'],
        });

        io.on('connection', (socket) => {
            logger.info(
                `${socket.handshake.address} connected on ${socket.handshake.time}.`
            );

            socket.on('disconnect', () => {
                logger.info(
                    `${socket.handshake.address} disconnected on ${socket.handshake.time}.`
                );
            });
        });

        logger.info(WSServer.SUCCESSFUL_START);
        return io;
    } catch (err) {
        throw new WSServerStartError(err);
    }
};

const startServers = async () => {
    try {
        const server = await startExpressServer();
        return await startWSServer(server);
    } catch (err) {
        logger.error("Couldn't start servers.", err);
        throw err;
    }
};

const main = async () => {
    try {
        await ScriptManager.buildImage();

        const ws = await startServers();
        ScriptManager.setWS(ws);

        //! not necessary right now
        // setInterval(ScriptManager.cleanup, 1000 * 20);
    } catch (err) {
        logger.error("Couldn't start app.", err);
    }
};

main();
