// @auto-i18n-check. Please do not delete the line.

import React from "react";
import {NextIntlClientProvider, useMessages} from 'next-intl';

export default function LocaleLayout({
                                         children,
                                         params: {locale}
                                     }: {
    children: React.ReactNode; params: { locale: string };
}) {
    const messages = useMessages();
    return (
        <html lang={locale}>
        <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
