import path from 'node:path';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';
import { PROD } from '../constants/environments';

const LOG_PATH = path.join(__dirname, '../../../data/logs');

const getLogFilePath = (filename: string) => {
    return path.join(LOG_PATH, `scrapper-%DATE%-${filename}.log`);
};

const getTransportOptions = (logLevel: string) => {
    return {
        filename: getLogFilePath(logLevel),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: logLevel,
    };
};

const getTransports = (transportFiles: string[]): TransportStream[] => {
    const transportStreams: TransportStream[] = [];

    transportFiles.forEach((transportFile) => {
        transportStreams.push(
            new transports.DailyRotateFile(getTransportOptions(transportFile))
        );
    });

    return transportStreams;
};

export const logger = createLogger({
    level: 'info',
    defaultMeta: { service: 'winston' },
    format: format.combine(
        format.errors({ stack: true }),
        format.splat(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf(
            ({ timestamp, level, message }) =>
                `[${timestamp as string}] ${level}: ${message}`
        )
    ),

    // transports: getTransports(['info', 'warn', 'error']),
    transports: getTransports(['info']),
});

if (!PROD) {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.splat(),
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.printf(
                    ({ timestamp, level, message }) =>
                        `[${timestamp as string}] ${level}: ${message}`
                )
            ),
        })
    );
}
