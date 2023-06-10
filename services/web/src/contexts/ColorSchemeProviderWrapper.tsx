'use client';

import { ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { useCallback } from 'react';

interface ColorSchemeProviderWrapperProps {
    children: React.ReactNode;
}

export const ColorSchemeProviderWrapper: React.FC<
    ColorSchemeProviderWrapperProps
> = ({ children }) => {
    const preferredColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: 'muzik-color-scheme',
        defaultValue: preferredColorScheme,
        getInitialValueInEffect: true,
    });

    const toggleColorScheme = useCallback(
        (value?: ColorScheme) =>
            setColorScheme(
                value || (colorScheme === 'dark' ? 'light' : 'dark')
            ),
        [colorScheme, setColorScheme]
    );

    useHotkeys([['mod+J', () => toggleColorScheme()]]);

    return (
        <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
        >
            {children}
        </ColorSchemeProvider>
    );
};
