import {
    ActionIcon,
    Burger,
    Group,
    Header,
    MediaQuery,
    Text,
    useMantineColorScheme,
    useMantineTheme,
} from '@mantine/core';
import Link from 'next/link';
import { MoonStars, Sun } from 'tabler-icons-react';

interface NavbarWrapperProps {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HeaderWrapper: React.FC<NavbarWrapperProps> = ({
    opened,
    setOpened,
}) => {
    const theme = useMantineTheme();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    return (
        <Header height={{ base: 50, md: 70 }}>
            <Group sx={{ height: '100%' }} px={20} position='apart'>
                <Link href='/'>
                    <Text className='font-bold text-blue-500' size='xl'>
                        Scrapper
                    </Text>
                </Link>
                <Group>
                    <ActionIcon
                        variant='outline'
                        onClick={() => toggleColorScheme()}
                        size={30}
                        color={dark ? 'yellow' : 'blue'}
                        title='Toggle color scheme'
                    >
                        {colorScheme === 'dark' ? (
                            <Sun size='1rem' />
                        ) : (
                            <MoonStars size='1rem' />
                        )}
                    </ActionIcon>
                    <MediaQuery largerThan='md' styles={{ display: 'none' }}>
                        <Burger
                            opened={opened}
                            onClick={() => setOpened((o: boolean) => !o)}
                            size='sm'
                            color={theme.colors.gray[6]}
                        />
                    </MediaQuery>
                </Group>
            </Group>
        </Header>
    );
};
