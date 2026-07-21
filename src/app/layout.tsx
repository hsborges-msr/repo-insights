import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { twMerge } from 'tailwind-merge';
import { env } from '@/helpers/env/browser';
import { AuthProvider } from '@/providers/AuthProvider';
import { UIProvider } from '@/providers/UIProvider';
import Footnote from './components/Footnote';
import Header from './components/Header';
import './globals.css';

/**
 *
 */
export async function generateViewport(): Promise<Viewport> {
  return {
    width: 'device-width',
    initialScale: 1
  };
}

/**
 *
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'RepoInsights: Discover the developers powering your favorite GitHub project',
    metadataBase: new URL(env.BASE_URL),
    openGraph: {
      url: env.BASE_URL,
      type: 'website',
      description: 'Discover the developers powering your favorite GitHub project',
      siteName: 'RepoInsights'
    }
  };
}

/**
 *  Root layout component
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Suspense>
          <AuthProvider>
            <UIProvider className="flex flex-col h-screen sm:mr-1.25">
              <Header className={twMerge('w-full sm:px-[15%]')} />
              <div className="grow sm:px-[15%]">{children}</div>
              <Footnote className="w-full sm:px-[15%] mt-12" />
            </UIProvider>
          </AuthProvider>
        </Suspense>
      </body>
      <GoogleAnalytics gaId={env.GA_ID} />
    </html>
  );
}