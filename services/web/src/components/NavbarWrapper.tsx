'use client';

import { useScript } from '@/hooks/useScript';
import { routes } from '@/shared/constants/routes';
import { Script } from '@/shared/types';
import {
    Accordion,
    Button,
    Group,
    Navbar,
    ScrollArea,
    Text,
    ThemeIcon,
    UnstyledButton,
} from '@mantine/core';
import Link from 'next/link';
import { GitPullRequest, LiveView } from 'tabler-icons-react';

interface NavbarWrapperProps {
    opened: boolean;
}

export const NavbarWrapper: React.FC<NavbarWrapperProps> = ({ opened }) => {
    const { script } = useScript();

    return (
        <Navbar
            p='xs'
            pt='xl'
            width={{ base: 240 }}
            hiddenBreakpoint='md'
            hidden={!opened}
        >
            <Navbar.Section grow component={ScrollArea}>
                <Links script={script} />
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
                    padding: theme.spacing.sm,
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

function Links({ script }: { script: Script | null }) {
    return (
        <div>
            {data.map((link) => (
                <MainLink {...link} key={link.label} />
            ))}

            {script && (
                <>
                    <MainLink
                        icon={<LiveView size='1rem' />}
                        color='green'
                        label={'Live Updates'}
                        link={`/script/${script.scriptId}/live`}
                        key={'navLink' + script.scriptId + '_live'}
                    />

                    <Accordion defaultValue='pastData'>
                        <Accordion.Item value='pastData'>
                            <Accordion.Control>Past Data</Accordion.Control>
                            <Accordion.Panel>
                                <div className='flex flex-wrap'>
                                    {Array.from({
                                        length: script.runNumber - 1,
                                    }).map((_, idx) => (
                                        <Button
                                            key={
                                                'navLink' +
                                                script.scriptId +
                                                idx
                                            }
                                            variant='outline'
                                            color='orange'
                                            m='sm'
                                            w='fit'
                                        >
                                            <Link
                                                href={`/script/${
                                                    script.scriptId
                                                }/past/${
                                                    script.runNumber - 1 - idx
                                                }`}
                                            >
                                                {script.runNumber - 1 - idx}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </>
            )}
        </div>
    );
}
