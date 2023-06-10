'use client';

import { ReactNode, createContext } from 'react';
import io, { Socket } from 'socket.io-client';

// const socket = io('/', {
//     path: '/socket.io',
//     transports: ['websocket'],
// });

const socket = io('http://localhost:3000', {
    path: '/socket.io',
    transports: ['websocket'],
});

export const SocketContext = createContext<Socket>(socket);

type SocketProviderProps = {
    children: ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
