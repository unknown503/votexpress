import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { createEmotionCache, MantineProvider } from "@mantine/core";
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from "@clerk/localizations";
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { Layout } from '@/components/Layout';
import { useEffect } from 'react';

const cache = createEmotionCache({
  key: 'mantine',
  prepend: false
});

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // @ts-ignore
    import('preline')
  }, [])

  return (
    <ClerkProvider localization={esES} {...pageProps} >
      <MantineProvider withGlobalStyles withNormalizeCSS emotionCache={cache}>
        <QueryClientProvider client={queryClient}>
          <Notifications limit={4} autoClose={6000} />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </QueryClientProvider>
      </MantineProvider>
    </ClerkProvider>
  )
}
