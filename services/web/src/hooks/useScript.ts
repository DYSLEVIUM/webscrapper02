'use client';

import { ScriptContext } from '@/contexts/ScriptProvider';
import { useContext } from 'react';

export const useScript = () => useContext(ScriptContext)!;
