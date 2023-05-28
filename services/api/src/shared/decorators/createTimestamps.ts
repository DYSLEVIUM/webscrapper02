import { logger } from '../utils/logger';

// using arrow function for 'this' contexts' gives this in the current scope
export function createTimestamps() {
    return function (
        _target: any,
        name: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;
        descriptor.value = async function () {
            const startTime = new Date(Date.now());
            await method.apply(this);
            const endTime = new Date(Date.now());
            logger.info(
                `${name}() took ${
                    (endTime.getTime() - startTime.getTime()) / 1000
                }s to complete.`
            );
        };
    };
}
