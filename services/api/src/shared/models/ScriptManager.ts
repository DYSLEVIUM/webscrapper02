import { createTimestamps } from '../decorators/createTimestamps';
import { ScriptNotFoundError } from '../errors/script';
import { logger } from '../utils/logger';
import DockerManager from './DockerManager';
import Script from './Script';

export default class ScriptManager {
    static readonly imageName = `python_script_bot_${Date.now()}`;
    private static scripts: Script[] = [];

    constructor() {
        return ScriptManager;
    }

    @createTimestamps()
    static async buildImage() {
        try {
            logger.info(`Building Script Image: ${this.imageName}.`);

            await new Promise((resolve, reject) => {
                DockerManager.docker.buildImage(
                    {
                        context: './script',
                        src: ['.dockerignore', 'scrapper', 'Dockerfile'],
                    },
                    { t: ScriptManager.imageName },
                    (err, response) => {
                        if (err) {
                            reject(err);
                        } else {
                            response?.pipe(process.stdout);
                            response?.on('end', resolve);
                            logger.info('Script image created.');
                        }
                    }
                );
            });
        } catch (err) {
            logger.error('Error while building script image.', err);
            throw err;
        }
    }

    static addScript(name: string, targetPrice: number, keywords: string) {
        ScriptManager.scripts.push(new Script(name, targetPrice, keywords));
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
            return await Promise.all(
                ScriptManager.scripts.map((script) => script.remove())
            );
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
            return script.remove();
        } catch (err) {
            logger.error(`Error while removing script ${id}.`, err);
            throw err;
        }
    }
}
