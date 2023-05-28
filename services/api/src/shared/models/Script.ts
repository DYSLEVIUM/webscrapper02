import Docker from 'dockerode';
import { v4 as uuid } from 'uuid';
import { Environment } from '../constants/environments';
import { createTimestamps } from '../decorators/createTimestamps';
import { ScriptExecutionError } from '../errors/script';
import { accessEnv } from '../utils/accessEnv';
import { logger } from '../utils/logger';
import DockerManager from './DockerManager';
import ScriptManager from './ScriptManager';

export default class Script {
    readonly scriptId = uuid();

    private static readonly containerVolumePath = '/usr/app/data';
    private static readonly hostVolumePath =
        '/usr/app/scrapper/data/api/script/data';
    private readonly createdAt: Date;
    private readonly containerName: string;

    private isActive = false;
    private updatedAt: Date;

    constructor(
        private readonly name: string,
        private targetPrice: number,
        private keywords: string
    ) {
        this.createdAt = this.updatedAt = new Date(Date.now()); // new Date() uses system time whereas new Date(Date.now()) uses UTC time
        this.containerName = `img-${
            ScriptManager.imageName
        }.name-${this.name.replaceAll(/[-.\\w ]/g, '_')}.id-${this.scriptId}`;

        // setInterval(() => {
        //     this.cleanup();
        // }, 1000 * 60);
    }

    //! complete it
    private cleanup() {
        console.log('clean script', this.containerName);
    }

    @createTimestamps()
    private runContainer(): Promise<void> {
        logger.info(`Running container ${this.containerName}.`);

        return new Promise((resolve, reject) => {
            DockerManager.docker
                .run(
                    ScriptManager.imageName,
                    ['out', this.targetPrice.toString(), this.keywords],
                    process.stdout,
                    {
                        name: this.containerName,
                        ENV: [
                            `${Environment.ROBOTSTXT_OBEY}=${accessEnv(
                                Environment.ROBOTSTXT_OBEY,
                                '0'
                            )}`,
                            `${Environment.CONCURRENT_REQUESTS}=${accessEnv(
                                Environment.CONCURRENT_REQUESTS,
                                '32'
                            )}`,
                            `${Environment.DOWNLOAD_DELAY}=${accessEnv(
                                Environment.DOWNLOAD_DELAY,
                                '0.5'
                            )}`,
                        ],
                        Volumes: {
                            [Script.containerVolumePath]: {},
                            [`${Script.containerVolumePath}/logs`]: {},
                        },
                        HostConfig: {
                            // AutoRemove: true,
                            // NetworkMode: 'scraps',
                            Binds: [
                                `${Script.hostVolumePath}/${this.containerName}:${Script.containerVolumePath}`,
                                `${Script.hostVolumePath}/${this.containerName}/logs:${Script.containerVolumePath}/logs`,
                            ],
                            // Mounts: [
                            //     {
                            //         Type: 'volume',
                            //         Source: '/usr/app/scrapper/data',
                            //         Target: hostVolumePath,
                            //         ReadOnly: false,
                            //     },
                            // ],
                        },
                        Tty: false,
                    }
                    // (err: any, data: any, container: Docker.Container) => {
                    //     console.log('err', err);
                    //     console.log('data', data);
                    //     container.run({ Cmd: ['ls', '-lah'], AttachStdout: true });
                    // }
                )
                .then(
                    (
                        data: [
                            { Error: Error; StatusCode: number },
                            Docker.Container
                        ]
                    ) => {
                        var [output, container] = data;

                        if (output.Error) {
                            logger.error(
                                `Error executing script: ${this.scriptId}.`,
                                new ScriptExecutionError(output.Error)
                            );
                            logger.error(
                                `Script ${this.scriptId} exited with status code: ${output.StatusCode}.`
                            );
                            reject(output.Error);
                        }

                        logger.info(
                            `Script ${this.scriptId} executed successfully and exited with status code ${output.StatusCode}.`
                        );

                        logger.info(
                            `Container ${this.containerName} ran successfully.`
                        );
                        resolve();
                        // return container.remove();
                    }
                )
                .catch((err) => {
                    logger.error(
                        `Error executing script: ${this.scriptId}.`,
                        err
                    );
                    reject(err);
                });
        });
    }

    @createTimestamps()
    private stopContainer(): Promise<void> {
        logger.info(`Stopping container ${this.containerName}.`);

        return new Promise((resolve, reject) => {
            DockerManager.docker
                .getContainer(this.containerName)
                .stop()
                .then(() => {
                    logger.info(
                        `Container ${this.containerName} stopped successfully.`
                    );
                    resolve();
                })
                .catch((err: Error) => {
                    logger.error(
                        `Error stopping container ${this.containerName}.`,
                        err
                    );
                    reject(err);
                });
        });
    }

    @createTimestamps()
    private removeContainer(): Promise<void> {
        logger.info(`Removing container ${this.containerName}.`);

        return new Promise((resolve, reject) => {
            const container = DockerManager.docker.getContainer(
                this.containerName
            );

            container.inspect((err: Error, _containerData: any) => {
                if (!err) {
                    container.remove({ v: true, force: true });
                    logger.info(`Container ${this.containerName} removed.`);
                    resolve();
                } else if (err.message.includes('no such container')) {
                    logger.error(
                        `Attempting to remove a container ${this.containerName} that does not exist, continuing without error.`,
                        err
                    );
                } else {
                    logger.error(
                        `Error encountered while removing container ${this.containerName}.`,
                        err
                    );
                    reject(err);
                }
            });
        });
    }

    start() {
        if (!this.isActive) {
            this.runContainer().catch((err) => {
                logger.error(
                    `Container ${this.containerName} encountered an error while running.`,
                    err
                );
            });

            this.isActive = true;
            this.updatedAt = new Date(Date.now());

            logger.info(`Script ${this.containerName} started.`);
        } else {
            logger.info(`Script ${this.containerName} was already running.`);
        }

        return Promise.resolve(this.scriptId);
    }

    stop() {
        if (this.isActive) {
            this.stopContainer().catch((err) => {
                logger.error(
                    `Container ${this.containerName} encountered an error while stopping.`,
                    err
                );
            });

            this.isActive = false;
            this.updatedAt = new Date(Date.now());

            logger.info(`Script ${this.containerName} stopped.`);
        } else {
            logger.info(`Script ${this.containerName} was not running.`);
        }

        return Promise.resolve(this.scriptId);
    }

    remove() {
        logger.info(`Script ${this.containerName} remove called.`);

        this.removeContainer().catch((err) => {
            logger.error(
                `Container ${this.containerName} encountered an error while removing.`,
                err
            );
        });

        return Promise.resolve(this.scriptId);
    }
}
