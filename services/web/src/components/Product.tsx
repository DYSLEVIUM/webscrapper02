import { Carousel } from '@mantine/carousel';
import {
    Badge,
    Button,
    Flex,
    Group,
    Image,
    Card as MantineCard,
    Spoiler,
    Text,
    useMantineTheme,
} from '@mantine/core';
// import Image from 'next/image';

import { default as ProductType } from '@/shared/types/Product';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { ExternalLink } from 'tabler-icons-react';

interface ProductProps {
    product: ProductType;
}

export const Product: React.FC<ProductProps> = ({ product }) => {
    const {
        name,
        price,
        condition,
        link,
        shipping_price,
        image_links,
        quantity_available,
    } = product;

    const [isLoadingImage, setIsLoadingImage] = useState(true);

    const theme = useMantineTheme();
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    return (
        <MantineCard shadow='sm' padding='lg' radius='md' withBorder h={'100%'}>
            <MantineCard.Section>
                <Carousel
                    withIndicators
                    height={250}
                    loop
                    slideGap='sm'
                    maw={mobile ? 330 : 500}
                >
                    {image_links.map((image_link) => (
                        <Carousel.Slide
                            key={image_link}
                            className='relative overflow-clip'
                        >
                            {/* <Image
                                src={image_link}
                                // fill
                                width={500}
                                height={250}
                                className={cn(
                                    'object-cover hover:opacity-75 duration-500 ease-in-out',
                                    isLoadingImage
                                        ? 'grayscale blur-2xl scale-110'
                                        : 'grayscale-0 blur-0 scale-100'
                                )}
                                style={{
                                    boxShadow:
                                        'inset 0 0 25px 10px rgba(0, 0, 0, 0.9)',
                                }}
                                alt={name}
                                onLoadingComplete={() =>
                                    setIsLoadingImage(false)
                                }
                            /> */}
                            <Image
                                src={image_link}
                                height={250}
                                className='object-cover duration-500 ease-in-out hover:opacity-75'
                                style={{
                                    boxShadow:
                                        'inset 0 0 25px 10px rgba(0, 0, 0, 0.9)',
                                }}
                                alt={name}
                                withPlaceholder
                            />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </MantineCard.Section>

            <Flex mih={270} align='center' justify='center'>
                <Flex direction='column'>
                    <Spoiler
                        maxHeight={50}
                        showLabel='Show more'
                        hideLabel='Hide'
                        mt='md'
                        mb='sm'
                    >
                        <Text fz='md' fw={700}>
                            {name}
                        </Text>
                    </Spoiler>

                    <Group position='apart' mb='xs' w={'100%'}>
                        <Text fz='xl' fw={700}>
                            {'$' + price}
                        </Text>
                        {condition ? (
                            <Badge color='pink' variant='light'>
                                {condition}
                            </Badge>
                        ) : null}
                    </Group>

                    <Group position='apart' mt='md' mb='xs'>
                        <Text fz='sm' color='dimmed'>
                            Shipping Price
                        </Text>
                        <Text fz='sm' fw={700} color='dimmed'>
                            {shipping_price ? (
                                <>{'$' + shipping_price}</>
                            ) : (
                                <>No data provided</>
                            )}
                        </Text>
                    </Group>

                    <Group position='apart' mt='md' mb='xs'>
                        <Text fz='sm' color='dimmed'>
                            Quantity Available
                        </Text>
                        <Text fz='sm' fw={700} color='dimmed'>
                            {quantity_available ? (
                                <>{quantity_available}</>
                            ) : (
                                <>No data provided</>
                            )}
                        </Text>
                    </Group>

                    <Button
                        variant='light'
                        color='blue'
                        fullWidth
                        mt='md'
                        radius='md'
                        component='a'
                        href={link}
                        target='_blank'
                    >
                        <Flex align='center' justify='space-between' gap='xs'>
                            <ExternalLink size='1rem' />
                            <Text fw={700}>See Details Now</Text>
                        </Flex>
                    </Button>
                </Flex>
            </Flex>
        </MantineCard>
    );
};
