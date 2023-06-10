export default interface Script {
    name: string;
    targetPrice: number;
    keywords: string;
    runFreq: number;
    scriptId: string;
    isActive: boolean;
    shouldBeRunning: boolean;
    updatedAt: Date;
    createdAt: Date;
    containerName: string;
}
