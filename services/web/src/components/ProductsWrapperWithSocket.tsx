'use client';

import { useScript } from '@/hooks/useScript';
import { useSocket } from '@/hooks/useSocket';
import { Script } from '@/shared/types';
import { default as ProductType } from '@/shared/types/Product';
import { getScriptRunNumberDataSSR } from '@/shared/utils/api';
import { convert1DTo2d } from '@/shared/utils/helper';
import {
    Box,
    Grid,
    Group,
    Pagination,
    Paper,
    Select,
    Text,
} from '@mantine/core';
import {
    Dispatch,
    SetStateAction,
    Suspense,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { Trash } from 'tabler-icons-react';
import LoadingSpinner from './LoadingSpinner';
import { Product } from './Product';

const pageSizes = [4, 12, 16, 24, 32];
export const ProductsWrapperWithSocket = ({ script }: { script: Script }) => {
    const { setScript } = useScript();

    const [jsonData, setJsonData] = useState<ProductType[]>([]);
    const [products, setProducts] = useState<ProductType[][]>([[]]);
    const [pageSize, setPageSize] = useState<number>(
        pageSizes[pageSizes.length >> 1]
    );

    const updateScript = useCallback(async () => {
        const runData = await getScriptRunNumberDataSSR(
            script.scriptId,
            Math.max(script.runNumber - 1, 1),
            false
        );

        setScript(runData.data?.script!);
        setJsonData(runData.data?.products || []);
    }, [script.scriptId, script.runNumber, setScript]);

    useEffect(() => {
        updateScript();
    }, [updateScript]);

    const socket = useSocket();
    const onMessageListener = useCallback(
        async (data: string) => {
            const jsonData = JSON.parse(data) as ProductType[];
            setJsonData(jsonData);
            await updateScript();
        },
        [updateScript]
    );

    useEffect(() => {
        // doing this for mantine pagination
        const convertedData = convert1DTo2d(jsonData, pageSize);
        setProducts(convertedData);
    }, [jsonData, pageSize]);

    useEffect(() => {
        const eventString = `script_msg_${script.scriptId}`;
        socket.on(eventString, onMessageListener);

        return () => {
            socket.off(eventString, onMessageListener);
        };
    }, [socket, onMessageListener, script.scriptId]);

    const [activePage, setPage] = useState(1);
    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const product = products.length ? (
        products[activePage - 1].map((product) => (
            <Grid.Col xl={3} lg={4} sm={6} xs={12} key={product.link}>
                <Product product={product} />
            </Grid.Col>
        ))
    ) : (
        <></>
    );

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <PaginationGroup
                activePage={activePage}
                setPage={setPage}
                products={products}
                pageSize={pageSize}
                setPageSize={setPage}
            />
            <Box
                sx={() => ({
                    transition: 'all 250ms ease',
                })}
            >
                <Paper
                    p='md'
                    mih={300}
                    className='relative flex items-center justify-start'
                    shadow='md'
                >
                    {!products || products.length === 0 ? (
                        <>
                            <Trash />
                            <Text h='100%'>No New Items</Text>
                        </>
                    ) : (
                        <>
                            <Grid gutter='xl'>{product}</Grid>
                        </>
                    )}
                </Paper>
            </Box>
            <PaginationGroup
                activePage={activePage}
                setPage={setPage}
                products={products}
                pageSize={pageSize}
                setPageSize={setPage}
            />
        </Suspense>
    );
};

const PageSelect = ({
    pageSize,
    setPageSize,
}: {
    pageSize: Number;
    setPageSize: Dispatch<SetStateAction<number>>;
}) => {
    return (
        <Select
            label='Page size'
            placeholder='Pick one'
            defaultValue='15'
            value={pageSize.toString()}
            data={pageSizes.map((pageSize) => {
                return {
                    value: pageSize.toString(),
                    label: pageSize.toString(),
                };
            })}
            onChange={(newPageSize) => {
                setPageSize(Number(newPageSize));
            }}
            size='sm'
            className='w-fit'
            maxDropdownHeight={200}
            maw={75}
        />
    );
};

const PaginationGroup = ({
    activePage,
    setPage,
    products,
    pageSize,
    setPageSize,
}: {
    activePage: number;
    setPage: Dispatch<SetStateAction<number>>;
    products: ProductType[][];
    pageSize: number;
    setPageSize: Dispatch<SetStateAction<number>>;
}) => {
    return (
        <Group position='apart' mt='md'>
            <Pagination
                mt='md'
                value={activePage}
                onChange={setPage}
                total={products.length}
                siblings={1}
                withEdges
                withControls
                size='sm'
                className='w-fit'
            />
            <PageSelect pageSize={pageSize} setPageSize={setPageSize} />
        </Group>
    );
};
