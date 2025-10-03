import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  showHeader = true,
  showFooter = true,
}) => {
  const router = useRouter();
  const { isLoading } = useAuth();
  
  // Pages where header/footer might be hidden
  const isAuthPage = router.pathname.startsWith('/auth');
  const isOnboardingPage = router.pathname.startsWith('/onboarding');
  const isPartnerPage = router.pathname.startsWith('/partner');
  
  // Hide header/footer on auth pages and partner pages (they have their own layout)
  const shouldShowHeader = showHeader && !isAuthPage && !isOnboardingPage && !isPartnerPage;
  const shouldShowFooter = showFooter && !isAuthPage && !isOnboardingPage && !isPartnerPage;

  const pageTitle = title 
    ? `${title} - PharmaFinder`
    : 'PharmaFinder - Trouvez vos médicaments facilement';

  const pageDescription = description 
    ? description
    : 'Trouvez rapidement vos médicaments dans les pharmacies de Lomé et commandez en ligne avec livraison ou retrait en magasin.';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Loading overlay - only show on protected pages when actually loading */}
        {isLoading && !isAuthPage && router.pathname.startsWith('/dashboard') && (
          <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        )}

        {/* Header */}
        {shouldShowHeader && <Header />}

        {/* Main Content */}
        <main className={`flex-1 ${shouldShowHeader ? 'pt-0' : ''}`}>
          {children}
        </main>

        {/* Footer */}
        {shouldShowFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;