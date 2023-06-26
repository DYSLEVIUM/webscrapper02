import { allConditionTypes } from '@/shared/types/Script';
import { createScript } from '@/shared/utils/api';
import { errorToast, successToast } from '@/shared/utils/toast';
import {
    Box,
    Button,
    Group,
    MultiSelect,
    NumberInput,
    Paper,
    TextInput,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import { hasLength, useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { AlertCircle, Clock, Coin, FileSearch } from 'tabler-icons-react';

const rightSection = (label: string) => {
    return (
        <Tooltip label={label} position='top-end' withArrow>
            <div>
                <AlertCircle
                    size='1rem'
                    style={{
                        display: 'block',
                        opacity: 0.5,
                    }}
                />
            </div>
        </Tooltip>
    );
};

export interface CreateScriptFormProps {
    closeModal: () => void;
    style?: React.CSSProperties;
}

export function CreateScriptForm({ style, closeModal }: CreateScriptFormProps) {
    const theme = useMantineTheme();

    const form = useForm({
        initialValues: {
            name: '',
            targetPriceMin: 0,
            targetPriceMax: 300,
            keywords: '',
            condition: '',
            runFreq: 600,
        },

        validate: {
            name: hasLength({ min: 3 }, 'Enter a name of minimum length 3.'),
            keywords: hasLength(
                { min: 3 },
                'Enter a keyword of minimum length 3.'
            ),
            targetPriceMin: (val, values) => {
                if (
                    typeof val !== 'number' ||
                    isNaN(val) ||
                    Number(val) < 0 ||
                    Number(val) > 10000
                )
                    return 'Enter a valid number.';
                if (Number(val) > Number(values.targetPriceMax))
                    return 'Minimum price cannot be greater that maximum price.';
                return null;
            },
            targetPriceMax: (val, values) => {
                if (
                    typeof val !== 'number' ||
                    isNaN(val) ||
                    Number(val) > 10000 ||
                    Number(val) < 0
                )
                    return 'Enter a valid number.';
                if (Number(val) < Number(values.targetPriceMin))
                    return 'Maximum price cannot be smaller that minimum price.';
                return null;
            },
            runFreq: (val) => {
                if (typeof val !== 'number' || isNaN(val) || val < 60)
                    return 'Enter a valid number.';
                return null;
            },
        },
    });

    const router = useRouter();

    const refreshData = useCallback(() => {
        router.refresh();
    }, [router]);

    const handleSubmit = useCallback(
        async ({
            name,
            targetPriceMin,
            targetPriceMax,
            keywords,
            condition,
            runFreq,
        }: {
            name: string;
            targetPriceMin: number;
            targetPriceMax: number;
            keywords: string;
            condition: string;
            runFreq: number;
        }) => {
            try {
                const data = await createScript({
                    name,
                    targetPriceMin,
                    targetPriceMax,
                    keywords,
                    condition,
                    runFreq,
                });
                successToast(
                    `Successfully created script.`,
                    `The ${name} script was created successfully.`
                );
                refreshData();
            } catch (err: any) {
                errorToast(
                    'Error creating script',
                    `An error occurred while creating the script.`
                );
                console.error(err);
            }
            closeModal();
        },
        [closeModal, refreshData]
    );

    return (
        <Paper
            style={style}
            sx={{
                position: 'relative',
                backgroundColor:
                    theme.colorScheme === 'dark'
                        ? theme.colors.dark[7]
                        : theme.white,
            }}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Group grow>
                    <TextInput
                        data-autofocus
                        required
                        placeholder='Name of the script'
                        description='Please enter the name of the script'
                        label='Script Name'
                        {...form.getInputProps('name')}
                        size='sm'
                        mt='md'
                    />

                    <MultiSelect
                        label='Condition'
                        description='Select the condition, leave empty for, any match.'
                        {...form.getInputProps('condition')}
                        placeholder='Conditions…'
                        data={allConditionTypes}
                        icon={<FileSearch size={16} />}
                        clearable
                        searchable
                    />
                </Group>

                <Group grow>
                    <NumberInput
                        withAsterisk
                        label='Target Price Minimum'
                        placeholder='Enter Target Price Minimum'
                        description='Please enter the target price (minimum = 0)'
                        // min={0}
                        step={1}
                        stepHoldDelay={500}
                        stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                        precision={2}
                        decimalSeparator='.'
                        icon={<Coin size='1rem' />}
                        {...form.getInputProps('targetPriceMin')}
                        size='sm'
                        mt='md'
                    />
                    <NumberInput
                        withAsterisk
                        label='Target Price Maximum'
                        placeholder='Enter Target Price Maximum'
                        description='Please enter the target price (maximum = 10,000)'
                        // min={0}
                        step={1}
                        stepHoldDelay={500}
                        stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                        precision={2}
                        decimalSeparator='.'
                        icon={<Coin size='1rem' />}
                        {...form.getInputProps('targetPriceMax')}
                        size='sm'
                        mt='md'
                    />
                </Group>

                <TextInput
                    withAsterisk
                    label='Keywords'
                    placeholder='Enter Keywords'
                    description='Please enter the keywords'
                    {...form.getInputProps('keywords')}
                    rightSection={rightSection(
                        'These keywords are used for scraping'
                    )}
                    size='sm'
                    mt='md'
                />

                <NumberInput
                    withAsterisk
                    label='Frequency'
                    placeholder='Enter running frequency'
                    description='Please enter the running frequency in seconds (minimum = 60)'
                    // min={60}
                    step={1}
                    stepHoldDelay={500}
                    stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
                    precision={2}
                    decimalSeparator='.'
                    icon={<Clock size='1rem' />}
                    {...form.getInputProps('runFreq')}
                    size='sm'
                    mt='md'
                />

                <Box mt='xl'>
                    <Button color='blue' type='submit'>
                        Create
                    </Button>
                </Box>
            </form>
        </Paper>
    );
}
