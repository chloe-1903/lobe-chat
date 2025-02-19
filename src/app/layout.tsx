import { SpeedInsights } from '@vercel/speed-insights/next';
import { ResolvingViewport } from 'next';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { isRtlLang } from 'rtl-detect';

import Analytics from '@/components/Analytics';
import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import PWAInstall from '@/features/PWAInstall';
import AuthProvider from '@/layout/AuthProvider';
import GlobalProvider from '@/layout/GlobalProvider';
import { isMobileDevice } from '@/utils/server/responsive';

const inVercel = process.env.VERCEL === '1';

type RootLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

const RootLayout = async ({ children, modal }: RootLayoutProps) => {
  const cookieStore = await cookies();

  const lang = cookieStore.get(LOBE_LOCALE_COOKIE);
  const locale = lang?.value || DEFAULT_LANG;

  const direction = isRtlLang(locale) ? 'rtl' : 'ltr';
  const mobile = await isMobileDevice();

  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <body>
        <GlobalProvider>
          <AuthProvider>
            {children}
            {!mobile && modal}
          </AuthProvider>
          <PWAInstall />
        </GlobalProvider>
        <Analytics />
        {inVercel && <SpeedInsights />}
      </body>
    </html>
  );
};

export default RootLayout;

export { generateMetadata } from './metadata';

export const generateViewport = async (): ResolvingViewport => {
  const isMobile = await isMobileDevice();

  const dynamicScale = isMobile ? { maximumScale: 1, userScalable: false } : {};

  return {
    ...dynamicScale,
    initialScale: 2,
    minimumScale: 1,
    themeColor: [
      { color: '#f8f8f8', media: '(prefers-color-scheme: light)' },
      { color: '#000', media: '(prefers-color-scheme: dark)' },
    ],
    viewportFit: 'cover',
    width: 'device-width',
  };
};
