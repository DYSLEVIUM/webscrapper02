'use client';
import { Center } from '@mantine/core';

export const Status = ({ state }: { state: boolean }) => {
    return (
        <Center>
            {state ? (
                <div
                    className={`animate-pulse w-2 h-2 bg-green-500 rounded-full shadow-[0_0_15px_2px_rgba(0,255,0,1)]`}
                />
            ) : (
                <div
                    className={`w-2 h-2 bg-red-500 rounded-full shadow-[0_0_15px_2px_rgba(255,0,0,1)]`}
                />
            )}
        </Center>
    );
};
