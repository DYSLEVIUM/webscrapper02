'use client';

import { errorToast } from '@/shared/utils/toast';
import { Button, Flex } from '@mantine/core';
import { notFound, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        errorToast('An error occurred.', error.message);
    }, [error]);

    if (error.message === 'NEXT_NOT_FOUND') return notFound();

    return (
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
                                void router.back();
                            }}
                            className='mr-8'
                        >
                            Go Back
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
    );
}
