import { ScriptDataTable } from '@/components/ScriptDataTable';
import { getAllScriptsData } from '@/shared/utils/api';
import { notFound } from 'next/navigation';

export default async function Dashboard() {
    const scriptsResponse = await getAllScriptsData();

    const { data: scripts, error, message } = scriptsResponse;

    if (error) {
        throw new Error(message, error);
    }

    if (!scripts) {
        return notFound();
    }

    return (
        <>
            <h1 className='py-0 pb-8 m-0'>Dashboard</h1>
            <ScriptDataTable scripts={scripts} />
        </>
    );
}

export const dynamic = 'force-dynamic';
