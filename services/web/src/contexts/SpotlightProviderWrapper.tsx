'use client';

import { routes } from '@/shared/constants/routes';
import { useMantineColorScheme } from '@mantine/core';
import type { SpotlightAction } from '@mantine/spotlight';
import { SpotlightProvider } from '@mantine/spotlight';
import { useRouter } from 'next/navigation';
import {
    Dashboard,
    FileText,
    Home,
    MoonStars,
    Search,
    Sun,
} from 'tabler-icons-react';

interface SpotlightProviderWrapperProps {
    children: React.ReactNode;
}

export const SpotlightProviderWrapper: React.FC<
    SpotlightProviderWrapperProps
> = ({ children }) => {
    const router = useRouter();

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    const actions: SpotlightAction[] = [
        {
            title: 'Dashboard',
            description: 'Get to dashboard page',
            onTrigger: () => {
                void router.push(routes.dashboard.path);
            },
            icon: <Home size={18} />,
        },
        {
            title: 'Change theme to' + (dark ? ' light' : ' dark'),
            description: 'Toggle between light and dark theme (Shotcut: ⌘+J)',
            onTrigger: () => toggleColorScheme(),
            icon: dark ? <Sun size={18} /> : <MoonStars size={18} />,
        },
        {
            title: 'Dashboard',
            description: 'Get full information about current system status',
            onTrigger: () => console.log('Dashboard'),
            icon: <Dashboard size={18} />,
        },
        {
            title: 'Documentation',
            description: 'Visit documentation to lean more about all features',
            onTrigger: () => console.log('Documentation'),
            icon: <FileText size={18} />,
        },
    ];
    return (
        <SpotlightProvider
            actions={actions}
            searchIcon={<Search size={16} />}
            searchPlaceholder='Search '
            shortcut={['mod + P', 'mod + K', '/']}
            nothingFoundMessage='Nothing found'
            zIndex={2049}
            limit={8}
        >
            {children}
        </SpotlightProvider>
    );
};
