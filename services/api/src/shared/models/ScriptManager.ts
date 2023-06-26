import { cp, rm } from 'fs/promises';
import path from 'node:path';
import { Server } from 'socket.io';
import { Environment } from '../constants/environments';
import { createTimestamps } from '../decorators/createTimestamps';
import { ScriptNotFoundError } from '../errors/script';
import { accessEnv } from '../utils/accessEnv';
import { logger } from '../utils/logger';
import DockerManager from './DockerManager';
import Script from './Script';

export default class ScriptManager {
    static readonly imageName = `python_script_bot_${Date.now()}`;

    public static WS: Server;
    private static scripts: Script[] = [];

    constructor() {
        return ScriptManager;
    }

    //! implement if needed
    // static async cleanup() {
    // }

    static setWS(ws: Server) {
        this.WS = ws;
    }

    //! move this to worker thread
    @createTimestamps()
    static async buildImage() {
        const tmpScriptPath = './scriptTmp';

        try {
            logger.info(`Building script image: ${this.imageName}.`);

            //! copying from host to this container (idk why its not taking from the host container 🤷 to the script container inside the api container)
            const scriptFolderPath =
                accessEnv(Environment.NODE_ENV, 'development') === 'development'
                    ? path.resolve(
                          __dirname,
                          '..',
                          '..',
                          '..',
                          'data',
                          'api',
                          'script'
                      )
                    : path.resolve(
                          __dirname,
                          '..',
                          '..',
                          'data',
                          'api',
                          'script'
                      ); // in prod, we have no src, so one less previous directory is used
            await cp(scriptFolderPath, tmpScriptPath, { recursive: true }).then(
                () => {
                    logger.info(`Created folder ${tmpScriptPath}.`);
                }
            );

            await new Promise((resolve, reject) => {
                DockerManager.docker.buildImage(
                    {
                        context: tmpScriptPath,
                        src: ['.dockerignore', 'scrapper/', 'Dockerfile'],
                    },
                    { t: ScriptManager.imageName },
                    (err, response) => {
                        if (err) {
                            reject(err);
                        } else {
                            // response?.pipe(process.stdout);
                            response?.on('data', (chunk) => {
                                const buffer = Buffer.from(chunk);
                                const stringStream = buffer.toString('utf-8');
                                // console.log(stringStream);
                            });
                            response?.on('end', resolve);
                        }
                    }
                );
            }).then(() => {
                logger.info(`Created script image ${this.imageName}.`);
            });
        } catch (err) {
            logger.error('Error while building script image.', err);
            throw err;
        } finally {
            await rm(tmpScriptPath, { recursive: true });
            logger.info(`Removed folder ${tmpScriptPath}.`);
        }
    }

    static addScript(
        name: string,
        targetPriceMin: number,
        targetPriceMax: number,
        condition: string,
        keywords: string,
        runFeq: number
    ): Promise<Script> {
        return new Promise((resolve, reject) => {
            try {
                logger.info(
                    `Creating script with name: ${name}, targetPrice: ${targetPriceMin} - ${targetPriceMax}, keywords: ${keywords}.`
                );
                const newScript = new Script(
                    name,
                    targetPriceMin,
                    targetPriceMax,
                    condition,
                    keywords,
                    runFeq
                );

                ScriptManager.scripts.push(newScript);
                resolve(newScript);
            } catch (err) {
                logger.error(
                    `Error while creating script with name: ${name}, targetPrice: ${targetPriceMin} - ${targetPriceMax}, keywords: ${keywords}.`,
                    err
                );
                reject(err);
            }
        });
    }

    static async startAllScripts() {
        try {
            logger.info('Starting all scripts.');
            return await Promise.all(
                ScriptManager.scripts.map((script) => script.start())
            );
        } catch (err) {
            logger.error('Error while starting all scripts.', err);
            throw err;
        }
    }

    static async startScript(id: string) {
        const script = ScriptManager.getScript(id);
        try {
            if (!script) {
                throw new ScriptNotFoundError({});
            }
            logger.info(`Starting script ${id}.`);
            return await script.start();
        } catch (err) {
            logger.error(`Error while starting script ${id}.`, err);
            throw err;
        }
    }

    static async stopAllScripts() {
        try {
            logger.info('Stopping all scripts.');
            return await Promise.all(
                ScriptManager.scripts.map((script) => script.stop())
            );
        } catch (err) {
            logger.error(`Error while stopping all scripts.`, err);
            throw err;
        }
    }

    static async stopScript(id: string) {
        const script = ScriptManager.getScript(id);
        try {
            if (!script) {
                throw new ScriptNotFoundError({});
            }
            logger.info(`Stopping script ${id}.`);
            return await script.stop();
        } catch (err) {
            logger.error(`Error while stopping script ${id}.`, err);
            throw err;
        }
    }

    static getAllScripts() {
        return ScriptManager.scripts;
    }

    static getScript(id: string) {
        return ScriptManager.scripts.find((script) => script.scriptId === id);
    }

    static async removeAllScripts() {
        try {
            logger.info('Removing all scripts.');

            const promiseData = await Promise.all(
                ScriptManager.scripts.map((script) => script.remove())
            );
            ScriptManager.scripts = [];

            return promiseData;
        } catch (err) {
            logger.error(`Error while removing all scripts.`, err);
            throw err;
        }
    }

    static async removeScript(id: string) {
        const script = ScriptManager.getScript(id);
        try {
            if (!script) {
                throw new ScriptNotFoundError({});
            }
            logger.info(`Removing script ${id}.`);

            const promiseData = await script.remove();
            ScriptManager.scripts = ScriptManager.scripts.filter(
                (script) => script.scriptId !== id
            );

            return promiseData;
        } catch (err) {
            logger.error(`Error while removing script ${id}.`, err);
            throw err;
        }
    }
}
