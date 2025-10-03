import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { CartProvider } from '../hooks/useCart';
import { NotificationsProvider } from '../hooks/useNotifications';
import Layout from '../components/Layout';

// Create a client
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPartnerPage = router.pathname.startsWith('/partner');
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <>
      <Head>
        <title>PharmaFinder - Trouvez vos médicaments facilement</title>
        <meta
          name="description"
          content="PharmaFinder vous aide à trouver rapidement vos médicaments dans les pharmacies de Lomé. Commandez en ligne avec livraison ou retrait en magasin."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pharmafinder.tg/" />
        <meta property="og:title" content="PharmaFinder - Trouvez vos médicaments facilement" />
        <meta property="og:description" content="Plateforme de référencement des pharmacies en Afrique de l'Ouest. Trouvez et commandez vos médicaments en ligne." />
        <meta property="og:image" content="/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pharmafinder.tg/" />
        <meta property="twitter:title" content="PharmaFinder - Trouvez vos médicaments facilement" />
        <meta property="twitter:description" content="Plateforme de référencement des pharmacies en Afrique de l'Ouest." />
        <meta property="twitter:image" content="/og-image.jpg" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="PharmaFinder" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PharmaFinder" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#22c55e" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <QueryClientProvider client={queryClient}>
        {isPartnerPage ? (
          // Partner pages don't use AuthProvider to avoid CORS issues
          <>
            <Component {...pageProps} />

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            {/* React Query Devtools */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </>
        ) : (
          <AuthProvider>
            <CartProvider>
              <NotificationsProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </NotificationsProvider>
            </CartProvider>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            {/* React Query Devtools */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AuthProvider>
        )}
      </QueryClientProvider>
    </>
  );
}

export default MyApp;