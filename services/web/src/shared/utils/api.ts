import { default as ProductType } from '@/shared/types/Product';
import { SERVER_URL } from '../constants/default';
import { APIResponse, Script } from '../types';

export const getScriptData = async (
    scriptId: string
): Promise<APIResponse<Script>> => {
    try {
        const res = await fetch(SERVER_URL + `/api/scriptManager/${scriptId}`, {
            // next: { revalidate: 10 },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch script data for ${scriptId}.`);
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const getScriptRunNumberDataSSR = async (
    scriptId: string,
    runNumber: number,
    SSR: boolean = true
): Promise<APIResponse<{ script: Script; products: ProductType[] }>> => {
    try {
        const res = await fetch(
            (SSR ? SERVER_URL : '') + `/api/pastRunsScriptData/data`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ scriptId, runNumber }),

                // next: {
                //     revalidate:
                //         process.env.NODE_ENV === 'development' ? 10 : 60,
                // }, //! should use on-demand ISR, but this works
                // cache: 'only-if-cached',
                cache: 'no-store',
            }
        );

        if (!res.ok) {
            throw new Error(
                `Failed to fetch script data for ${scriptId} and runNumber ${runNumber}.`
            );
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const getAllScriptsData = async (): Promise<APIResponse<Script[]>> => {
    try {
        const res = await fetch(SERVER_URL + '/api/scriptManager/all', {
            // next: { revalidate: 10 },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error("Failed to fetch all scripts' data.");
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const startAllScripts = async () => {
    try {
        const res = await fetch('/api/scriptManager/start/all', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to start all scripts.');
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const stopAllScripts = async () => {
    try {
        const res = await fetch('/api/scriptManager/stop/all', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to stop all scripts.');
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const removeAllScripts = async () => {
    try {
        const res = await fetch('/api/scriptManager/remove/all', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to remove all scripts.');
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const startScripts = async (ids: string[]) => {
    try {
        const res = await fetch('/api/scriptManager/start/ids', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to start scripts ${ids.join(', ')}.`);
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const stopScripts = async (ids: string[]) => {
    try {
        const res = await fetch('/api/scriptManager/stop/ids', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to stop scripts ${ids.join(', ')}.`);
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const removeScripts = async (ids: string[]) => {
    try {
        const res = await fetch('/api/scriptManager/remove/ids', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to remove scripts ${ids.join(', ')}.`);
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};

export const createScript = async ({
    name,
    targetPrice,
    keywords,
    runFreq,
}: {
    name: string;
    targetPrice: number;
    keywords: string;
    runFreq: number;
}) => {
    try {
        const res = await fetch('/api/scriptManager/create', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, targetPrice, keywords, runFreq }),
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to create script ${name}.`);
        }

        return await res.json();
    } catch (err) {
        throw err;
    }
};
