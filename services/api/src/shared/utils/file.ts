import csvParser from 'csv-parser';
import { createReadStream } from 'fs';
import { access, constants, readFile, rm, writeFile } from 'node:fs/promises';
import { logger } from './logger';

//! use worker nodes later for file operations

const checkFileOrFolderExists = async (path: string) => {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch (err) {
        logger.error(`File/Folder ${path} does not exist.`, err);
        return false;
    }
};

export const getFileContents = async (filePath: string) => {
    try {
        await checkFileOrFolderExists(filePath);
        const data = await readFile(filePath, { encoding: 'utf-8' });
        return await JSON.parse(data);
    } catch (err) {
        logger.error(`Error reading file ${filePath}.`, err);
    }
};

export const removeFileOrFolder = async (path: string) => {
    try {
        await checkFileOrFolderExists(path);
        await rm(path, { recursive: true, force: true });
        logger.info(`Deleted file/folder ${path}.`);
    } catch (err) {
        logger.error(`Error deleting file/folder ${path}.`, err);
    }
};

export const readCsvFile = async <T>(filePath: string) => {
    const rows: T[] = [];

    try {
        await checkFileOrFolderExists(filePath);
        return await new Promise((resolve, reject) =>
            createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row: T) => rows.push(row))
                .on('end', () => resolve(rows))
                .on('error', (err: any) => reject(err))
        );
    } catch (err) {
        logger.error(`Error reading csv file ${filePath}.`, err);
        throw err;
    }
};

export const writeCsvFile = async <T>(filePath: string, rows: T[]) => {
    if (!rows) throw new Error('No rows provided.');
    if (!filePath) throw new Error('No filePath provided.');

    try {
        if (await checkFileOrFolderExists(filePath))
            await removeFileOrFolder(filePath);

        const data = rows
            .map((row) =>
                Object.values(row as Array<string | number>).join(',')
            )
            .join('\n');

        logger.info(`Writing ${rows.length} to ${filePath}.`);
        await writeFile(filePath, data);

        return filePath;
    } catch (err) {
        logger.error(`Error while writing to CSV: ${filePath}.`, err);
        throw err;
    }
};
