import { ProductsWrapperWithSocket } from '@/components/ProductsWrapperWithSocket';
import { getScriptData } from '@/shared/utils/api';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface ScriptProps {
    params: { scriptId: string };
}

export default async function ScriptLive({ params }: ScriptProps) {
    const { scriptId } = params;

    const scriptFetchData = await getScriptData(scriptId);

    if (scriptFetchData.error) {
        throw scriptFetchData.error;
    }

    if (!scriptFetchData.data) {
        notFound();
    }

    return (
        <Suspense fallback={<>Loading</>}>
            <div className='flex justify-between w-full pr-4'>
                <h1 className='py-0 m-0'>{scriptFetchData.data.name} (LIVE)</h1>
            </div>
            <ProductsWrapperWithSocket script={scriptFetchData.data} />
        </Suspense>
    );
}
