import { ContextProviders } from '@/contexts';
import { montserrat } from './fonts';
import './globals.css';

import { AppShellWrapper } from '@/components/AppShellWrapper';

export const metadata = {
    title: 'Scrapper',
    description: 'Ebay Scrapper',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en' className={`${montserrat.variable}`}>
            <body>
                <ContextProviders>
                    <AppShellWrapper>{children}</AppShellWrapper>
                </ContextProviders>
            </body>
        </html>
    );
}
