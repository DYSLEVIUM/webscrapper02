export const allConditionTypes = [
    'New',
    'Open box',
    'Certified - Refurbished',
    'Excellent - Refurbished',
    'Very Good - Refurbished',
    'Good - Refurbished',
    'Seller refurbished',
    'Used',
    'For parts or not working',
] as const;

type ConditionType = (typeof allConditionTypes)[number];

export default interface Script {
    name: string;
    targetPriceMin: number;
    targetPriceMax: number;
    condition: ConditionType;
    keywords: string;
    runFreq: number;
    scriptId: string;
    isActive: boolean;
    shouldBeRunning: boolean;
    updatedAt: Date;
    createdAt: Date;
    containerName: string;
    runNumber: number;
}
