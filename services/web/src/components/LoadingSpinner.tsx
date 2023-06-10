'use client';

import { LoadingOverlay } from '@mantine/core';

export default function LoadingSpinner() {
    return (
        <LoadingOverlay
            visible={true}
            overlayBlur={5}
            transitionDuration={500}
            overlayOpacity={0.1}
        />
    );
}
