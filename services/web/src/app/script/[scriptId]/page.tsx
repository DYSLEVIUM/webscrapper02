import { ProductsWrapper } from '@/components/ProductsWrapper';
import { getScriptData } from '@/shared/utils/api';
import { notFound } from 'next/navigation';

interface ScriptProps {
    params: { scriptId: string };
}

export default async function Script({ params }: ScriptProps) {
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
            <h1 style={{ marginTop: 0 }}>{scriptFetchData.data.name}</h1>
            <ProductsWrapper scriptId={scriptId} />
        </>
    );
}
