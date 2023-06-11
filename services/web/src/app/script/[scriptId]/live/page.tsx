import { ProductsWrapperWithSocket } from '@/components/ProductsWrapperWithSocket';
import { getScriptData } from '@/shared/utils/api';
import { notFound } from 'next/navigation';

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
        <>
            <h1 className='py-0 m-0'>{scriptFetchData.data.name}</h1>
            <ProductsWrapperWithSocket
                scriptId={scriptId}
                latestValidRunNumber={Math.max(
                    scriptFetchData.data.runNumber - 1,
                    1
                )}
            />
        </>
    );
}
