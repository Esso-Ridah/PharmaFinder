import React from 'react';
import PartnerHeader from './PartnerHeader';

interface PartnerLayoutProps {
  children: React.ReactNode;
}

const PartnerLayout: React.FC<PartnerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer spécifique partenaires (optionnel) */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              © 2025 PharmaFinder - Espace Partenaire
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-green-600">Support</a>
              <a href="#" className="hover:text-green-600">Documentation</a>
              <a href="#" className="hover:text-green-600">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PartnerLayout;