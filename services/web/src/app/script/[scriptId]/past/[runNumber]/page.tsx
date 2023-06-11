import { ProductsWrapper } from '@/components/ProductsWrapper';
import { getScriptRunNumberDataSSR } from '@/shared/utils/api';
import { notFound } from 'next/navigation';

interface ScriptProps {
    params: { scriptId: string; runNumber: number };
}

export default async function ScriptPast({ params }: ScriptProps) {
    const { scriptId, runNumber } = params;

    if (!runNumber || isNaN(runNumber)) {
        throw new Error('Run Number must be a number. ');
    }

    const runData = await getScriptRunNumberDataSSR(
        scriptId,
        Number(runNumber)
    );

    if (runData.error) {
        throw runData.error;
    }

    if (!runData.data || runData.data.script.runNumber < Number(runNumber)) {
        notFound();
    }

    return (
        <>
            <h1 className='py-0 m-0'>{runData.data.script.name}</h1>
            <h1 className='py-0 m-0'>{runNumber}</h1>
            <ProductsWrapper products={runData.data.products} />
        </>
    );
}
