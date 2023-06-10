'use client';

import { routes } from '@/shared/constants/routes';
import { Group, Navbar, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import Link from 'next/link';
import { GitPullRequest } from 'tabler-icons-react';

interface NavbarWrapperProps {
    opened: boolean;
}

export const NavbarWrapper: React.FC<NavbarWrapperProps> = ({ opened }) => {
    return (
        <Navbar
            p='xs'
            pt='xl'
            width={{ base: 240 }}
            hiddenBreakpoint='md'
            hidden={!opened}
        >
            <Navbar.Section grow>
                <MainLinks />
            </Navbar.Section>
        </Navbar>
    );
};

interface MainLinkProps {
    icon: React.ReactNode;
    color: string;
    label: string;
    link: string;
}

function MainLink({ icon, color, label, link }: MainLinkProps) {
    return (
        <Link href={link}>
            <UnstyledButton
                sx={(theme) => ({
                    display: 'block',
                    width: '100%',
                    padding: theme.spacing.xl,
                    borderRadius: theme.radius.sm,
                    color:
                        theme.colorScheme === 'dark'
                            ? theme.colors.dark[0]
                            : theme.black,

                    '&:hover': {
                        backgroundColor:
                            theme.colorScheme === 'dark'
                                ? theme.colors.dark[6]
                                : theme.colors.gray[0],
                    },
                })}
            >
                <Group>
                    <ThemeIcon color={color} variant='light'>
                        {icon}
                    </ThemeIcon>

                    <Text size='sm'>{label}</Text>
                </Group>
            </UnstyledButton>
        </Link>
    );
}

const data = [
    {
        icon: <GitPullRequest size='1rem' />,
        color: 'blue',
        label: 'Dashboard',
        link: routes.dashboard.path,
    },
];

function MainLinks() {
    return (
        <div>
            {data.map((link) => (
                <MainLink {...link} key={link.label} />
            ))}
        </div>
    );
}
