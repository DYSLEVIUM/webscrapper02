import Docker from 'dockerode';
import { v4 as uuid } from 'uuid';
import { Environment } from '../constants/environments';
import { createTimestamps } from '../decorators/createTimestamps';
import { ScriptExecutionError } from '../errors/script';
import { accessEnv } from '../utils/accessEnv';
import {
    getFileContents,
    removeFileOrFolder,
    writeDataToFile,
} from '../utils/file';
import { getGmailTransporter, setDifference } from '../utils/helper';
import { logger } from '../utils/logger';
import DockerManager from './DockerManager';
import { Product } from './Product';
import ScriptManager from './ScriptManager';

export default class Script {
    readonly scriptId = uuid();

    private static readonly containerVolumePath = '/usr/app/data';
    private static readonly hostVolumePath =
        '/usr/app/scrapper/data/api/script/data';

    private readonly createdAt: Date;
    private readonly containerName: string;

    private readonly folderPath: string;

    private isActive = false;
    private shouldBeRunning = false;
    private updatedAt: Date;
    private runNumber: number = 1;

    constructor(
        private readonly name: string,
        private targetPriceMin: number,
        private targetPriceMax: number,
        private condition: string,
        private keywords: string,
        private runFreq: number
    ) {
        this.createdAt = this.updatedAt = new Date(Date.now()); // new Date() uses system time whereas new Date(Date.now()) uses UTC time
        this.containerName = `img-${
            ScriptManager.imageName
        }.name-${this.name.replaceAll(/[-.\\w ]/g, '_')}.id-${this.scriptId}`;
        this.folderPath = `/usr/app/data/script/data/${this.containerName}`;
    }

    private getRunScriptOutDataPath(
        hostMachine: boolean = true,
        containerScript: boolean = false,
        withExt: boolean = true
    ) {
        return (
            (hostMachine ? `${this.folderPath}/` : '') +
            'out' +
            (containerScript ? '_script' : '') +
            (withExt ? '.json' : '')
        );
    }

    private getRunScriptNewDataPath(
        runNumber: number,
        withJsonExt: boolean = true
    ) {
        return (
            `${this.folderPath}/new_${runNumber}.` + (withJsonExt ? 'json' : '')
        );
    }

    getRunNumber() {
        return this.runNumber;
    }

    private async calculateDiff(): Promise<Product[]> {
        try {
            if (this.runNumber === 1) {
                return (await getFileContents(
                    this.getRunScriptOutDataPath(true, true, true)
                )) as Product[];
            }

            const prevJSONFileData = (await getFileContents(
                this.getRunScriptOutDataPath(true, false, true)
            )) as Product[];
            const currJSONFileData = (await getFileContents(
                this.getRunScriptOutDataPath(true, true, true)
            )) as Product[];

            // we need to realize the instances before we use them
            const prevProductsSetRealized = prevJSONFileData.map(
                (product) => new Product(product)
            );
            const currProductsSetRealized = currJSONFileData.map(
                (product) => new Product(product)
            );

            const differenceSet = setDifference<Product>(
                currProductsSetRealized,
                prevProductsSetRealized
            );

            if (!differenceSet.length) {
                return [];
            }
            return differenceSet;
        } catch (err) {
            logger.error(
                `Error occurred while calculating script data diff for ${this.scriptId}.`,
                err
            );
            throw err;
        }
    }

    async getScriptDiffFromRunNumber(runNumber: number) {
        if (runNumber > this.runNumber - (this.isActive ? 1 : 0)) return [];
        try {
            logger.info(
                `Reading data for diff of ${this.scriptId} for runNumber ${this.runNumber}.`
            );
            return await getFileContents(
                this.getRunScriptNewDataPath(runNumber, true)
            );
        } catch (err) {
            logger.error(
                `Error while fetching diff data for script ${this.scriptId} and runNumber ${runNumber}.`,
                err
            );
            throw err;
        }
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
                        this.getRunScriptOutDataPath(false, true, false),
                        this.targetPriceMin.toString(),
                        this.targetPriceMax.toString(),
                        this.condition,
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
                                const data = await this.calculateDiff();

                                logger.info(`Found ${data.length} new items.`);

                                if (data.length) {
                                    const identifier = `script_msg_${this.scriptId}`;
                                    ScriptManager.WS.emit(
                                        identifier,
                                        JSON.stringify(data)
                                    );
                                    logger.info(
                                        `Emitted data to ${identifier}.`
                                    );

                                    const prevData =
                                        this.runNumber === 1
                                            ? []
                                            : ((await getFileContents(
                                                  this.getRunScriptOutDataPath(
                                                      true,
                                                      false,
                                                      true
                                                  )
                                              )) as Product[]);

                                    const newData = [...prevData, ...data];
                                    await writeDataToFile(
                                        this.getRunScriptOutDataPath(
                                            true,
                                            false,
                                            true
                                        ),
                                        newData
                                    ); // overwriting with new Data in out.json

                                    await writeDataToFile(
                                        this.getRunScriptNewDataPath(
                                            this.runNumber
                                        ),
                                        data
                                    ); // making new file to write in new_${this.runNumber}.json

                                    const gmailTransporter =
                                        await getGmailTransporter();
                                    await gmailTransporter
                                        .sendMail(
                                            `(Web Scrapper 2.0) New Items for ${this.keywords} and runNumber ${this.runNumber} found!`,
                                            `Found ${data.length} new items.`,
                                            [
                                                await Product.exportToCsv(
                                                    data,
                                                    this.getRunScriptNewDataPath(
                                                        this.runNumber,
                                                        false
                                                    ) + 'csv'
                                                ),
                                            ]
                                        )
                                        .catch((err) => {
                                            logger.error(
                                                `Error sending email for ${this.scriptId}.`,
                                                err
                                            );
                                        });
                                    ++this.runNumber; // updating runNumber here, not the actual runNumber but is to keep track of the files data runNumber
                                }
                            } catch (err) {
                                logger.error(
                                    `Error occurred while doing difference and sending email.`,
                                    err
                                );
                            }
                        })
                        .then(() => {
                            this.isActive = false;
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
