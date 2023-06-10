'use client';

import { SocketContext } from '@/contexts/SocketProvider';
import { useContext } from 'react';

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};
