'use client';

import { errorToast } from '@/shared/utils/toast';
import { Button, Flex } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { montserrat } from './fonts';

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.log(error);
        errorToast('An error occurred.', error.message);
    }, [error]);

    return (
        <html lang='en' className={`${montserrat.variable}`}>
            <body>
                <main className='flex items-center h-full p-16 dark:bg-gray-900 dark:text-gray-100'>
                    <div className='container flex flex-col items-center justify-center px-5 mx-auto my-8'>
                        <div className='max-w-md text-center'>
                            <h2 className='mb-8 font-extrabold text-9xl dark:text-gray-600'>
                                <div className='relative'>
                                    <span className='sr-only'>Error</span>
                                    <div className='bg-[#FF6A3D] px-2 text-sm rounded'>
                                        An error occurred.
                                    </div>
                                </div>
                            </h2>
                            <p className='text-2xl font-semibold md:text-3xl'>
                                Something went wrong!
                            </p>
                            <Flex justify='space-between' className='p-4'>
                                <Button
                                    onClick={() => {
                                        void router.replace('/');
                                    }}
                                    className='mr-8'
                                >
                                    Go Home
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={
                                        // Attempt to recover by trying to re-render the segment
                                        () => reset()
                                    }
                                >
                                    Try Again
                                </Button>
                            </Flex>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
