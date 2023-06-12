'use client';

import { Notifications } from '@mantine/notifications';
import { ColorSchemeProviderWrapper } from './ColorSchemeProviderWrapper';
import { MantineProviderWrapper } from './MantineProviderWrapper';
import { ScriptProvider } from './ScriptProvider';
import { SocketProvider } from './SocketProvider';
import { SpotlightProviderWrapper } from './SpotlightProviderWrapper';

interface ContextProvidersProps {
    children: React.ReactNode;
}

export const ContextProviders: React.FC<ContextProvidersProps> = ({
    children,
}) => {
    return (
        <>
            <ColorSchemeProviderWrapper>
                <MantineProviderWrapper>
                    <SpotlightProviderWrapper>
                        <SocketProvider>
                            <ScriptProvider>{children}</ScriptProvider>
                        </SocketProvider>
                    </SpotlightProviderWrapper>
                    <Notifications limit={5} autoClose={5000} />
                </MantineProviderWrapper>
            </ColorSchemeProviderWrapper>
        </>
    );
};
