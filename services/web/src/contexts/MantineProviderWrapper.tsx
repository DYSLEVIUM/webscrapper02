'use client';

import { Global, MantineProvider, useMantineColorScheme } from '@mantine/core';

interface MantineProviderWrapperProps {
    children: React.ReactNode;
}

export const MantineProviderWrapper: React.FC<MantineProviderWrapperProps> = ({
    children,
}) => {
    const { colorScheme } = useMantineColorScheme();
    return (
        <MantineProvider
            theme={{
                colorScheme,
            }}
            withGlobalStyles
            withNormalizeCSS
        >
            <Global
                styles={() => ({
                    '*, *::before, *::after': {
                        boxSizing: 'border-box',
                    },
                })}
            />
            {children}
        </MantineProvider>
    );
};
