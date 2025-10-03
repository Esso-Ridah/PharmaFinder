import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import clsx from 'clsx';

import { api, Product, Pharmacy } from '../lib/api';

interface SearchBarProps {
  onSelect?: () => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSelect, 
  placeholder = "Rechercher un médicament ou une pharmacie...",
  className = ""
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search products
  const { data: products = [], isLoading: productsLoading } = useQuery(
    ['search', 'products', query],
    () => api.products.search({ query, limit: 5 }).then(res => res.data),
    {
      enabled: query.length >= 2,
      staleTime: 30000, // 30 seconds
    }
  );

  // Search pharmacies
  const { data: pharmacies = [], isLoading: pharmaciesLoading } = useQuery(
    ['search', 'pharmacies', query],
    () => api.pharmacies.list({ skip: 0, limit: 5 }).then(res => 
      res.data.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.address.toLowerCase().includes(query.toLowerCase())
      )
    ),
    {
      enabled: query.length >= 2,
      staleTime: 30000,
    }
  );

  const isLoading = productsLoading || pharmaciesLoading;
  const hasResults = products.length > 0 || pharmacies.length > 0;
  const totalResults = products.length + pharmacies.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < totalResults - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex === -1) {
            handleSearch();
          } else {
            handleSelectResult(selectedIndex);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedIndex, totalResults, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
      onSelect?.();
    }
  };

  const handleSelectResult = (index: number) => {
    if (index < products.length) {
      // Selected a product
      const product = products[index];
      router.push(`/products/${product.id}`);
    } else {
      // Selected a pharmacy
      const pharmacy = pharmacies[index - products.length];
      router.push(`/pharmacies/${pharmacy.id}`);
    }
    
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    onSelect?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div ref={searchRef} className={clsx("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              Recherche en cours...
            </div>
          ) : hasResults ? (
            <div>
              {/* Products Section */}
              {products.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Médicaments
                  </div>
                  {products.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      className={clsx(
                        "w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                        selectedIndex === index && "bg-primary-50"
                      )}
                      onClick={() => handleSelectResult(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          {product.generic_name && (
                            <p className="text-xs text-gray-500">
                              {product.generic_name}
                            </p>
                          )}
                          {product.manufacturer && (
                            <p className="text-xs text-gray-400">
                              {product.manufacturer}
                            </p>
                          )}
                        </div>
                        {product.requires_prescription && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-800">
                            Ordonnance
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pharmacies Section */}
              {pharmacies.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                    Pharmacies
                  </div>
                  {pharmacies.map((pharmacy, index) => {
                    const actualIndex = products.length + index;
                    return (
                      <button
                        key={pharmacy.id}
                        type="button"
                        className={clsx(
                          "w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                          selectedIndex === actualIndex && "bg-primary-50"
                        )}
                        onClick={() => handleSelectResult(actualIndex)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {pharmacy.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pharmacy.address}
                            </p>
                            {pharmacy.phone && (
                              <p className="text-xs text-gray-400">
                                {pharmacy.phone}
                              </p>
                            )}
                          </div>
                          {pharmacy.is_verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800">
                              Vérifiée
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* View All Results */}
              <div className="border-t border-gray-200">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm text-primary-600 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={handleSearch}
                >
                  Voir tous les résultats pour "{query}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Aucun résultat trouvé pour "{query}"</p>
              <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;