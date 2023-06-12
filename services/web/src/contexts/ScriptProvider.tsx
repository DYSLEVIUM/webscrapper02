'use client';

import { Script } from '@/shared/types';
import { ReactNode, createContext, useState } from 'react';

interface ScriptContextType {
    script: Script | null;
    setScript: React.Dispatch<React.SetStateAction<Script | null>>;
}

export const ScriptContext = createContext<ScriptContextType | undefined>(
    undefined
);

type ScriptProviderProps = {
    children: ReactNode;
};

export const ScriptProvider: React.FC<ScriptProviderProps> = ({ children }) => {
    const [script, setScript] = useState<Script | null>(null);

    return (
        <ScriptContext.Provider value={{ script, setScript }}>
            {children}
        </ScriptContext.Provider>
    );
};
