'use client';

import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <main className='flex items-center h-full p-16 dark:bg-gray-900 dark:text-gray-100'>
            <div className='container flex flex-col items-center justify-center px-5 mx-auto my-8'>
                <div className='max-w-md text-center'>
                    <h2 className='mb-8 font-extrabold text-9xl dark:text-gray-600'>
                        <div className='relative'>
                            <span className='sr-only'>Error</span>404
                            <div className='bg-[#FF6A3D] px-2 text-sm rounded rotate-12 absolute top-1/2 left-1/3'>
                                Page Not Found
                            </div>
                        </div>
                    </h2>
                    <p className='text-2xl font-semibold md:text-3xl'>
                        Sorry, we couldn&apos;t find this page.
                    </p>
                    <Button
                        onClick={() => {
                            void router.replace('/');
                        }}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </main>
    );
}
