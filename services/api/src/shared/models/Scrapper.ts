import { v4 as uuid } from 'uuid';
import { ScrapperNotFoundError } from '../errors/scrapper';

export class ScrapperManager {
    private static _instance: ScrapperManager;
    private scrappers: Scrapper[] = [];

    constructor() {
        if (ScrapperManager._instance) {
            return ScrapperManager._instance;
        }
        ScrapperManager._instance = this;
    }

    addScrapper(name: string, keywords: string, targetPrice: number) {
        ScrapperManager._instance.scrappers.push(
            new Scrapper(name, keywords, targetPrice)
        );
    }

    async startAllScrappers() {
        try {
            return await Promise.all(
                this.scrappers.map((scrapper) => scrapper.start())
            );
        } catch (err) {
            throw err;
        }
    }

    async startScrapper(id: string) {
        const scrapper = this.getScrapper(id);
        try {
            if (!scrapper) {
                throw new ScrapperNotFoundError({});
            }

            return await scrapper.start();
        } catch (err) {
            throw err;
        }
    }

    async stopAllScrappers() {
        try {
            await Promise.all(
                this.scrappers.map((scrapper) => scrapper.stop())
            );
        } catch (err) {
            throw err;
        }
    }

    async stopScrapper(id: string) {
        const scrapper = this.getScrapper(id);
        try {
            if (!scrapper) {
                throw new ScrapperNotFoundError({});
            }

            await scrapper.stop();
        } catch (err) {
            throw err;
        }
    }
    getAllScrappers() {
        return this.scrappers;
    }

    getScrapper(id: string) {
        return this.scrappers.find((scrapper) => scrapper.scrapperId === id);
    }

    async removeAllScrappers() {
        try {
            await this.stopAllScrappers();
            this.scrappers = [];
        } catch (err) {
            throw err;
        }
    }

    async removeScrapper(id: string) {
        try {
            await this.stopScrapper(id);
            this.scrappers = this.scrappers.filter(
                (scrapper) => scrapper.scrapperId !== id
            );
        } catch (err) {
            throw err;
        }
    }
}

class Scrapper {
    readonly scrapperId = uuid();
    private readonly createdAt: Date;

    private enabled = false;
    private updatedAt: Date;

    constructor(
        private readonly name: string,
        private keywords: string,
        private targetPrice: number
    ) {
        this.createdAt = this.updatedAt = new Date();
    }

    async start() {
        this.updatedAt = new Date();
        this.enabled = true;

        return Promise.resolve(true);
    }

    async stop() {
        this.updatedAt = new Date();
        this.enabled = false;

        return Promise.resolve(true);
    }
}
