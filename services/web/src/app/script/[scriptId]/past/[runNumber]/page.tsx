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

    console.log('runData', runData);

    return (
        <>
            <div className='flex justify-between w-full pr-4'>
                <h1 className='py-0 m-0'>
                    {runData.data.script.name} (Run: {runNumber})
                </h1>
            </div>
            <ProductsWrapper
                script={runData.data.script}
                products={runData.data.products}
            />
        </>
    );
}
