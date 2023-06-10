'use client';

import { AppShell } from '@mantine/core';
import React, { useState } from 'react';
import { HeaderWrapper } from './HeaderWrapper';
import { NavbarWrapper } from './NavbarWrapper';

interface AppShellWrapperProps {
    children: React.ReactNode;
}

export const AppShellWrapper: React.FC<AppShellWrapperProps> = ({
    children,
}) => {
    const [opened, setOpened] = useState(false);

    return (
        <AppShell
            navbarOffsetBreakpoint='md'
            navbar={<NavbarWrapper opened={opened} />}
            header={<HeaderWrapper opened={opened} setOpened={setOpened} />}
            styles={(theme) => ({
                main: {
                    backgroundColor:
                        theme.colorScheme === 'dark'
                            ? theme.colors.dark[8]
                            : theme.colors.gray[0],
                },
            })}
        >
            {children}
        </AppShell>
    );
};
