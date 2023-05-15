//  accessing a variable inside process.env, throwing an error if it is not found
//  caching the values improves the performance as accessing process.env many times is bad

const cache: { [key: string]: string } = {};

export const accessEnv = (key: string, defaultValue: string) => {
    if (!(key in process.env) || typeof process.env[key] === 'undefined') {
        if (defaultValue) return defaultValue;
        throw new Error(`${key} is not an environment variable`);
    }

    if (!(key in cache)) cache[key] = process.env[key] as string;

    return cache[key];
};
