import Docker from 'dockerode';
import { v4 as uuid } from 'uuid';
import { Environment } from '../constants/environments';
import { createTimestamps } from '../decorators/createTimestamps';
import { ScriptExecutionError } from '../errors/script';
import { accessEnv } from '../utils/accessEnv';
import { getFileContents, removeFileOrFolder } from '../utils/file';
import { getGmailTransporter } from '../utils/helper';
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

    // private readonly filePath: string;
    private readonly folderPath: string;

    private isActive = false;
    private shouldBeRunning = false;
    private updatedAt: Date;
    private runNumber: number = 0;

    constructor(
        private readonly name: string,
        private targetPrice: number,
        private keywords: string,
        private runFreq: number
    ) {
        this.createdAt = this.updatedAt = new Date(Date.now()); // new Date() uses system time whereas new Date(Date.now()) uses UTC time
        this.containerName = `img-${
            ScriptManager.imageName
        }.name-${this.name.replaceAll(/[-.\\w ]/g, '_')}.id-${this.scriptId}`;
        this.folderPath = `/usr/app/data/script/data/${this.containerName}`;
    }

    private getRunScriptOutData(
        fullPathInHost: boolean,
        runNumber: number,
        withExt: boolean = true
    ) {
        return (
            (fullPathInHost ? `${this.folderPath}/` : '') +
            'out_' +
            runNumber +
            (withExt ? '.json' : '')
        );
    }

    getRunNumber() {
        return this.runNumber;
    }

    async getScriptRunData(runNumber: number) {
        if (
            runNumber < 1 ||
            runNumber > this.runNumber - (this.isActive ? 1 : 0)
        )
            return [];
        return (await getFileContents(
            this.getRunScriptOutData(true, runNumber, true)
        )) as any[];
    }

    @createTimestamps()
    private runScript(): Promise<void> {
        logger.info(`Running container ${this.containerName}.`);

        return new Promise((resolve, reject) => {
            this.isActive = true;
            DockerManager.docker
                .run(
                    ScriptManager.imageName,
                    [
                        this.getRunScriptOutData(
                            false,
                            ++this.runNumber,
                            false
                        ),
                        this.targetPrice.toString(),
                        this.keywords,
                    ],
                    process.stdout,
                    {
                        name: this.containerName,
                        ENV: [
                            `${Environment.NODE_ENV}=${accessEnv(
                                Environment.NODE_ENV,
                                'development'
                            )}`,
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
                            [`${Script.containerVolumePath}/log`]: {},
                        },
                        HostConfig: {
                            AutoRemove: true,
                            // NetworkMode: 'scraps',
                            Binds: [
                                `${Script.hostVolumePath}/${this.containerName}:${Script.containerVolumePath}`,
                                `${Script.hostVolumePath}/${this.containerName}/log:${Script.containerVolumePath}/log`,
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
                        this.isActive = false;
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
                    this.isActive = false;
                    reject(err);
                });
        });
    }

    @createTimestamps()
    private stopScript(): Promise<void> {
        logger.info(`Stopping container ${this.containerName}.`);

        return new Promise((resolve, reject) => {
            DockerManager.docker
                .getContainer(this.containerName)
                .stop()
                .then(() => {
                    this.isActive = false;
                    this.shouldBeRunning = false;
                    logger.info(
                        `Container ${this.containerName} stopped successfully.`
                    );
                    resolve();
                })
                .catch((err: Error) => {
                    this.shouldBeRunning = false; // even if we get an error, we should not be running further
                    logger.error(
                        `Error stopping container ${this.containerName}.`,
                        err
                    );
                    reject(err);
                });
        });
    }

    @createTimestamps()
    private removeScript(): Promise<void> {
        logger.info(`Removing container ${this.containerName}.`);

        return new Promise((resolve, reject) => {
            const container = DockerManager.docker.getContainer(
                this.containerName
            );

            container.inspect((err: Error, _containerData: any) => {
                if (!err) {
                    container.remove({ v: true, force: true });
                    logger.info(`Container ${this.containerName} removed.`);

                    this.isActive = false;
                    this.shouldBeRunning = false;

                    resolve();
                } else if (err.message.includes('no such container')) {
                    this.isActive = false;
                    this.shouldBeRunning = false;

                    logger.info(
                        `Attempting to remove a container ${this.containerName} that does not exist, continuing without error.`,
                        err
                    );
                } else {
                    this.shouldBeRunning = false; // even if we get error while removing, it should not be running further
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
        if (this.shouldBeRunning) {
            logger.info(`Script ${this.containerName} is already running.`);
        } else {
            this.shouldBeRunning = true;
            this.updatedAt = new Date(Date.now());

            const intervalFunc = () => {
                if (!this.isActive) {
                    this.runScript()
                        .then(async () => {
                            try {
                                const data = await this.getScriptRunData(
                                    this.runNumber
                                );

                                const identifier = `script_msg_${this.scriptId}`;
                                ScriptManager.WS.emit(
                                    identifier,
                                    JSON.stringify(data)
                                );
                                logger.info(`Emitted data to ${identifier}.`);

                                const gmailTransporter =
                                    await getGmailTransporter();
                                await gmailTransporter
                                    .sendMail(
                                        `(webScrapper02 test) New Items for ${this.keywords} found!`,
                                        `Found ${data.length} new items.`
                                        // await Product.exportToCsv(
                                        //     this.newProductsSet,
                                        //     './newItems.csv'
                                        // )
                                    )
                                    .catch((err) => {
                                        logger.error(
                                            `Error sending email for ${this.scriptId}.`,
                                            err
                                        );
                                    });
                            } catch (err) {
                                logger.error(
                                    `Error occurred while fetching data from file ${this.getScriptRunData(
                                        this.runNumber
                                    )}.`,
                                    err
                                );
                            }
                        })
                        .catch((err) => {
                            logger.error('error here at start()', err);
                        });
                }
            };

            intervalFunc(); // initial call
            const interval = setInterval(() => {
                if (this.shouldBeRunning) {
                    intervalFunc();
                } else {
                    clearInterval(interval);
                }
            }, 1000 * this.runFreq);
        }

        return Promise.resolve(this.scriptId);
    }

    stop() {
        if (this.shouldBeRunning) {
            this.shouldBeRunning = false;
            this.updatedAt = new Date(Date.now());

            this.stopScript().catch((err) => {
                logger.error('error here at stop()', err);
            });
        } else {
            logger.info(`Script ${this.containerName} was not running.`);
        }

        return Promise.resolve(this.scriptId);
    }

    remove() {
        this.removeScript().catch((err) => {
            logger.error(
                `Error while removing script ${this.containerName}.`,
                err
            );
        });

        removeFileOrFolder(this.folderPath).catch((err) => {
            logger.error(
                `Error while removing folder ${this.folderPath}.`,
                err
            );
        });

        return Promise.resolve(this.scriptId);
    }
}
