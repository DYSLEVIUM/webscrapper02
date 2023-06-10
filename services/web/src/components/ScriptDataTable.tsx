'use client';

import { Script } from '@/shared/types';
import {
    removeAllScripts,
    removeScripts,
    startAllScripts,
    startScripts,
    stopAllScripts,
    stopScripts,
} from '@/shared/utils/api';
import { errorToast, successToast } from '@/shared/utils/toast';
import {
    ActionIcon,
    Button,
    Center,
    Flex,
    Menu,
    Modal,
    Paper,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import { DatePicker, DatesRangeValue } from '@mantine/dates';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
    Dots,
    Eye,
    HandStop,
    PlayerPlay,
    Plus,
    Search,
    Trash,
} from 'tabler-icons-react';
import { CreateScriptForm } from './CreateScriptForm';
import { Status } from './Status';

interface ScriptDataTableProps {
    scripts: Script[];
}

const PAGE_SIZES = [5, 10, 15, 20, 25];

export const ScriptDataTable: React.FC<ScriptDataTableProps> = ({
    scripts: initialScripts,
}) => {
    const router = useRouter();

    const refreshData = useCallback(() => {
        router.refresh();
    }, [router]);

    // const columns = Object.keys(initialScripts[0] || ({} as Script));

    // searching and filtering
    const [filteredScripts, setFilteredScripts] = useState(initialScripts);
    const [query, setQuery] = useState('');
    const [createdAtSearchRange, setCreatedAtSearchRange] =
        useState<DatesRangeValue>();
    const [debouncedQuery] = useDebouncedValue(query, 200);

    useEffect(() => {
        setFilteredScripts(
            initialScripts.filter(({ name, createdAt }) => {
                if (
                    debouncedQuery !== '' &&
                    !name
                        .toLowerCase()
                        .includes(debouncedQuery.trim().toLowerCase())
                ) {
                    return false;
                }

                const [createdAtSearchRangeStart, createdAtSearchRangeEnd] =
                    createdAtSearchRange || [];
                if (
                    createdAtSearchRange &&
                    createdAtSearchRangeStart &&
                    createdAtSearchRangeEnd &&
                    (dayjs(createdAtSearchRangeStart).isAfter(
                        createdAt,
                        'day'
                    ) ||
                        dayjs(createdAtSearchRangeEnd).isBefore(
                            createdAt,
                            'day'
                        ))
                ) {
                    return false;
                }

                return true;
            })
        );
    }, [initialScripts, createdAtSearchRange, debouncedQuery]);

    // sorting
    const [sortedScripts, setSortedScripts] = useState(filteredScripts);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'index',
        direction: 'asc',
    });

    useEffect(() => {
        const data = sortBy(
            filteredScripts,
            sortStatus.columnAccessor
        ) as Script[];
        setSortedScripts(
            sortStatus.direction === 'desc' ? data.reverse() : data
        );
    }, [filteredScripts, sortStatus]);

    // selection
    const [selectedScripts, setSelectedScripts] = useState<Script[]>([]);

    // pagination
    const [pageSize, setPageSize] = useState(
        PAGE_SIZES[PAGE_SIZES.length >> 1]
    );
    const [paginatedScripts, setPaginatedScripts] = useState(
        sortedScripts.slice(0, pageSize)
    );
    const [page, setPage] = useState(1);

    useEffect(() => {
        // const from = Math.min(
        //     (page - 1) * pageSize,
        //     Math.max(sortedScripts.length - pageSize, 0)
        // );
        // const to = Math.min(from + pageSize, sortedScripts.length);
        // setPaginatedScripts(sortedScripts.slice(from, to));
        setPaginatedScripts(
            sortedScripts.slice((page - 1) * pageSize, page * pageSize)
        );
    }, [sortedScripts, page, pageSize]);

    const [modalOpened, { open: modalOpen, close: modalClose }] =
        useDisclosure(false);

    return (
        <>
            <Modal
                opened={modalOpened}
                onClose={modalClose}
                title='Create Script'
                centered
                overlayProps={{
                    opacity: 0.5,
                    blur: 5,
                }}
                size='xl'
            >
                <CreateScriptForm closeModal={modalClose} />
            </Modal>
            <Paper my='xl' p='xl' withBorder radius='sm' shadow='md'>
                <Flex
                    justify='center'
                    align='center'
                    direction='row'
                    wrap='wrap'
                    gap='xl'
                >
                    <Button
                        uppercase
                        leftIcon={<Plus size={16} />}
                        color='blue'
                        onClick={modalOpen}
                        w={300}
                    >
                        Create
                    </Button>
                    <Button
                        uppercase
                        w={300}
                        leftIcon={<PlayerPlay size={16} />}
                        color='green'
                        disabled={!selectedScripts.length}
                        onClick={async () => {
                            try {
                                if (
                                    selectedScripts.length ===
                                    initialScripts.length
                                ) {
                                    const data = await startAllScripts();
                                    refreshData();
                                    successToast(
                                        'Scripts started.',
                                        'All scripts started.'
                                    );
                                } else {
                                    const data = await startScripts(
                                        selectedScripts.map(
                                            (script) => script.name
                                        )
                                    );
                                    refreshData();
                                    successToast(
                                        'Scripts started.',
                                        'All selected scripts started.'
                                    );
                                }
                            } catch (err) {
                                errorToast(
                                    'An error occurred.',
                                    'Error while starting script.'
                                );
                            }
                        }}
                    >
                        {selectedScripts.length
                            ? `Start ${
                                  selectedScripts.length === 1
                                      ? 'one selected record'
                                      : `${selectedScripts.length} selected records`
                              }`
                            : 'Select records to start'}
                    </Button>
                    <Button
                        w={300}
                        uppercase
                        leftIcon={<HandStop size={16} />}
                        color='orange'
                        disabled={!selectedScripts.length}
                        onClick={async () => {
                            try {
                                if (
                                    selectedScripts.length ===
                                    initialScripts.length
                                ) {
                                    const data = await stopAllScripts();
                                    refreshData();
                                    successToast(
                                        'Scripts stopped.',
                                        'All scripts stopped.'
                                    );
                                } else {
                                    const data = await stopScripts(
                                        selectedScripts.map(
                                            (script) => script.name
                                        )
                                    );
                                    refreshData();
                                    successToast(
                                        'Scripts stopped.',
                                        'All selected scripts stopped.'
                                    );
                                }
                            } catch (err) {
                                errorToast(
                                    'An error occurred.',
                                    'Error while stopping script.'
                                );
                            }
                        }}
                    >
                        {selectedScripts.length
                            ? `Stop ${
                                  selectedScripts.length === 1
                                      ? 'one selected record'
                                      : `${selectedScripts.length} selected records`
                              }`
                            : 'Select records to stop'}
                    </Button>
                    <Button
                        w={300}
                        uppercase
                        leftIcon={<Trash size={16} />}
                        color='red'
                        disabled={!selectedScripts.length}
                        onClick={async () => {
                            try {
                                if (
                                    selectedScripts.length ===
                                    initialScripts.length
                                ) {
                                    const data = await removeAllScripts();
                                    setSelectedScripts([]);
                                    refreshData();
                                    successToast(
                                        'Scripts removed.',
                                        'All scripts removed.'
                                    );
                                } else {
                                    const data = await removeScripts(
                                        selectedScripts.map(
                                            (script) => script.name
                                        )
                                    );
                                    refreshData();
                                    successToast(
                                        'Scripts removed.',
                                        'All selected scripts removed.'
                                    );
                                }
                            } catch (err) {
                                errorToast(
                                    'An error occurred.',
                                    'Error while removing script.'
                                );
                            }
                        }}
                    >
                        {selectedScripts.length
                            ? `Remove ${
                                  selectedScripts.length === 1
                                      ? 'one selected record'
                                      : `${selectedScripts.length} selected records`
                              }`
                            : 'Select records to remove'}
                    </Button>
                </Flex>
            </Paper>
            <DataTable
                noHeader={!initialScripts.length}
                columns={[
                    {
                        accessor: 'index',
                        title: <Text>#</Text>,
                        textAlignment: 'center',
                        width: 60,
                        sortable: true,
                        render: (script) => initialScripts.indexOf(script) + 1,
                    },
                    // ...columns.map((key) => {
                    //     return {
                    //         accessor: key,
                    //         sortable: true,
                    //     };
                    // }),
                    {
                        title: <Text>Name</Text>,
                        textAlignment: 'left',
                        width: 240,
                        accessor: 'name',
                        sortable: true,
                        render: ({ name, scriptId }) => (
                            <Link
                                href={`/script/${scriptId}`}
                                className='font-bold cursor-pointer w-fit'
                                target='_blank'
                            >
                                {name}
                            </Link>
                        ),
                        filter: (
                            <TextInput
                                label='Scripts'
                                description='Show scripts whose names include the specified text'
                                placeholder='Search scripts...'
                                icon={<Search size={16} />}
                                value={query}
                                onChange={(e) =>
                                    setQuery(e.currentTarget.value)
                                }
                            />
                        ),
                        filtering: query !== '',
                    },
                    {
                        title: <Text>Target Price ($)</Text>,
                        textAlignment: 'right',
                        width: 180,
                        accessor: 'targetPrice',
                        sortable: true,
                        render: ({ targetPrice }) => `${targetPrice}`,
                    },
                    {
                        title: <Text>Run Frequency (s)</Text>,
                        textAlignment: 'right',
                        width: 190,
                        accessor: 'runFreq',
                        sortable: true,
                    },
                    {
                        title: <Text>Status</Text>,
                        textAlignment: 'center',
                        width: 120,
                        accessor: 'shouldBeRunning',
                        sortable: true,
                        render: ({ shouldBeRunning }) => (
                            <Status state={shouldBeRunning} />
                        ),
                    },
                    {
                        title: <Text>Created at</Text>,
                        textAlignment: 'center',
                        width: 180,
                        accessor: 'createdAt',
                        sortable: true,
                        render: ({ createdAt }) =>
                            dayjs(createdAt).format('DD MMM, YYYY'),

                        filter: ({ close }) => (
                            <Stack>
                                <DatePicker
                                    maxDate={new Date()}
                                    type='range'
                                    value={createdAtSearchRange}
                                    onChange={setCreatedAtSearchRange}
                                />
                                <Button
                                    disabled={!createdAtSearchRange}
                                    color='red'
                                    onClick={() => {
                                        setCreatedAtSearchRange(undefined);
                                        close();
                                    }}
                                >
                                    Reset
                                </Button>
                            </Stack>
                        ),
                        filtering: Boolean(createdAtSearchRange),
                    },
                    {
                        accessor: 'actions',
                        textAlignment: 'center',
                        width: 100,
                        render: ({ name, scriptId }) => (
                            <Menu
                                position='bottom-end'
                                withArrow
                                arrowPosition='center'
                                offset={3}
                                width={120}
                                shadow='md'
                            >
                                <Menu.Target>
                                    <Center
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                        }}
                                    >
                                        <ActionIcon variant='default'>
                                            <Dots size={16} />
                                        </ActionIcon>
                                    </Center>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item
                                        icon={
                                            <ActionIcon
                                                color='green'
                                                component='span'
                                            >
                                                <Eye size={16} />
                                            </ActionIcon>
                                        }
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            void router.push(
                                                `/script/${scriptId}`
                                            );
                                        }}
                                    >
                                        Show
                                    </Menu.Item>
                                    {/* <Menu.Item
                                        icon={
                                            <ActionIcon
                                                color='blue'
                                                component='span'
                                            >
                                                <Edit size={16} />
                                            </ActionIcon>
                                        }
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            void router.push(
                                                `/script/${scriptId}/edit`
                                            );
                                        }}
                                    >
                                        Edit
                                    </Menu.Item> */}

                                    <Menu.Item
                                        icon={
                                            <ActionIcon
                                                color='green'
                                                component='span'
                                            >
                                                <PlayerPlay size={16} />
                                            </ActionIcon>
                                        }
                                        onClick={async (ev) => {
                                            ev.stopPropagation();
                                            try {
                                                const data = await startScripts(
                                                    [scriptId]
                                                );
                                                console.log(data);
                                                refreshData();
                                                successToast(
                                                    `Script ${name} started.`,
                                                    `Script ${name} was started successfully.`
                                                );
                                            } catch (err) {
                                                errorToast(
                                                    'An error occurred.',
                                                    'Error while removing script.'
                                                );
                                            }
                                        }}
                                    >
                                        Start
                                    </Menu.Item>

                                    <Menu.Item
                                        icon={
                                            <ActionIcon
                                                color='orange'
                                                component='span'
                                            >
                                                <HandStop size={16} />
                                            </ActionIcon>
                                        }
                                        onClick={async (ev) => {
                                            ev.stopPropagation();
                                            try {
                                                const data = await stopScripts([
                                                    scriptId,
                                                ]);
                                                console.log(data);
                                                refreshData();
                                                successToast(
                                                    `Script ${name} stopped.`,
                                                    `Script ${name} was stopped successfully.`
                                                );
                                            } catch (err) {}
                                        }}
                                    >
                                        Stop
                                    </Menu.Item>

                                    <Menu.Divider />

                                    <Menu.Label>Danger zone</Menu.Label>
                                    <Menu.Item
                                        icon={
                                            <ActionIcon
                                                color='red'
                                                component='span'
                                            >
                                                <Trash size={16} />
                                            </ActionIcon>
                                        }
                                        onClick={async (ev) => {
                                            ev.stopPropagation();
                                            try {
                                                const data =
                                                    await removeScripts([
                                                        scriptId,
                                                    ]);
                                                console.log(data);
                                                refreshData();
                                                successToast(
                                                    `Removed script ${name}.`,
                                                    `Script ${name} was removed successfully.`
                                                );
                                            } catch (err) {
                                                errorToast(
                                                    'An error occurred.',
                                                    'Error while removing script.'
                                                );
                                            }
                                        }}
                                    >
                                        Remove
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        ),
                    },
                ]}
                // onRowClick={({ scriptId }) => {
                //     void router.push(`/script/${scriptId}`);
                // }}
                // rowExpansion={{
                //     collapseProps: {
                //         transitionDuration: 200,
                //         animateOpacity: true,
                //         transitionTimingFunction: 'ease-in-out',
                //     },
                //     content: ({ record }) => (
                //         <Stack p='xs' spacing={6}>
                //             <Group spacing={6}>
                //                 <Text>Details:</Text>
                //                 <Text>
                //                     {record.containerName}, {record.isActive},{' '}
                //                     {record.runFreq}
                //                 </Text>
                //             </Group>
                //             <Group spacing={6}>
                //                 <Text>Run Frequency:</Text>
                //                 <Text>{record.runFreq}</Text>
                //             </Group>
                //         </Stack>
                //     ),
                // }}
                idAccessor='scriptId'
                records={paginatedScripts}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                selectedRecords={selectedScripts}
                onSelectedRecordsChange={setSelectedScripts}
                totalRecords={initialScripts.length}
                recordsPerPageOptions={PAGE_SIZES}
                recordsPerPage={pageSize}
                onRecordsPerPageChange={(newPageSize) => {
                    setPage(1);
                    setPageSize(newPageSize);
                }}
                page={page}
                onPageChange={(p) => setPage(p)}
                mih={500}
                withBorder
                borderRadius='sm'
                shadow='xl'
                withColumnBorders
                striped
                highlightOnHover
                horizontalSpacing='xl'
                verticalSpacing='lg'
                fontSize='sm'
                verticalAlignment='center'
                recordsPerPageLabel='Scripts per page'
            />
        </>
    );
};
