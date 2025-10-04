import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, MicrophoneIcon, CameraIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import clsx from 'clsx';

import { api, Product, Pharmacy } from '../lib/api';

// Web Speech API type declarations
declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

interface UnifiedSearchBarProps {
  onSelect?: () => void;
  placeholder?: string;
  className?: string;
  prominent?: boolean;
  variant?: 'default' | 'compact';
  initialQuery?: string;
}

interface SearchResult {
  type: 'product' | 'pharmacy' | 'location';
  item: Product | Pharmacy | { name: string; type: 'location' };
  sponsored?: boolean;
}

const TOGO_LOCATIONS = [
  'Lomé', 'Tokoin', 'Nyékonakpoé', 'Amoutivé', 'Adidogomé', 'Hédzranawoé',
  'Bè', 'Aflao', 'Djidjolé', 'Kégué', 'Agbalépédogan', 'Totsi'
];

// Helper function for better text matching
const getMatchScore = (text: string, query: string): number => {
  if (!text || !query) return 0;

  const textLower = text.toLowerCase().trim();
  const queryLower = query.toLowerCase().trim();

  // Exact match gets highest score
  if (textLower === queryLower) return 100;

  // Starts with gets high score
  if (textLower.startsWith(queryLower)) return 90;

  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 70;

  // Word starts matching
  const words = textLower.split(/\s+/);
  const queryWords = queryLower.split(/\s+/);

  for (const word of words) {
    for (const qWord of queryWords) {
      if (word.startsWith(qWord)) return 60;
    }
  }

  return 0;
};

// Helper function to filter and sort items by relevance
function filterAndSortByRelevance<T>(
  items: T[],
  query: string,
  getTextFields: (item: T) => string[]
): T[] {
  if (!query.trim()) return items;

  return items
    .map(item => ({
      item,
      score: Math.max(...getTextFields(item).map(field => getMatchScore(field, query)))
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

const UnifiedSearchBar: React.FC<UnifiedSearchBarProps> = ({
  onSelect,
  placeholder = "Tapez votre recherche...",
  className = "",
  prominent = false,
  variant = 'default',
  initialQuery = ''
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [detectedType, setDetectedType] = useState<'product' | 'pharmacy' | 'location' | 'mixed'>('mixed');
  const [spellingSuggestions, setSpellingSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search products with improved matching
  const { data: products = [], isLoading: productsLoading } = useQuery(
    ['unified-search', 'products', query],
    async () => {
      if (query.length < 1) return [];
      try {
        const response = await api.products.search({ query, limit: 12 });
        // Use our smart filtering function to improve local results
        return filterAndSortByRelevance(
          response.data,
          query,
          (product: Product) => [
            product.name || '',
            product.generic_name || '',
            product.manufacturer || '',
            product.active_ingredient || ''
          ]
        ).slice(0, 8); // Keep top 8 most relevant
      } catch (error) {
        console.warn('Product search failed:', error);
        return [];
      }
    },
    {
      enabled: query.length >= 1,
      staleTime: 30000,
      retry: 1,
    }
  );

  // Search pharmacies with improved filtering
  const { data: pharmacies = [], isLoading: pharmaciesLoading } = useQuery(
    ['unified-search', 'pharmacies', query],
    async () => {
      if (query.length < 1) return [];
      try {
        const response = await api.pharmacies.list({ skip: 0, limit: 10 });
        // Use our smart filtering function
        return filterAndSortByRelevance(
          response.data,
          query,
          (pharmacy: Pharmacy) => [
            pharmacy.name || '',
            pharmacy.address || '',
            pharmacy.city || ''
          ]
        ).slice(0, 5); // Limit to top 5 after sorting
      } catch (error) {
        console.warn('Pharmacy search failed:', error);
        return [];
      }
    },
    {
      enabled: query.length >= 1,
      staleTime: 30000,
      retry: 1,
    }
  );

  const isLoading = productsLoading || pharmaciesLoading;

  // Stabilize products and pharmacies arrays to prevent infinite loops
  const stableProducts = useMemo(() => products || [], [JSON.stringify(products)]);
  const stablePharmacies = useMemo(() => pharmacies || [], [JSON.stringify(pharmacies)]);

  // Detect search type and organize results using useMemo to prevent infinite loops
  const { searchResults: computedResults, detectedType: computedType } = useMemo(() => {
    if (query.length < 1) {
      return {
        searchResults: [],
        detectedType: 'mixed' as const
      };
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase().trim();

    // Improved location matching - check for starts with and includes
    const locationMatches = TOGO_LOCATIONS.filter(loc => {
      const lowerLoc = loc.toLowerCase();
      // Prioritize starts with, then includes
      return lowerLoc.startsWith(lowerQuery) || lowerLoc.includes(lowerQuery);
    })
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      // Sort by relevance: starts with query first
      const aStarts = aLower.startsWith(lowerQuery);
      const bStarts = bLower.startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    })
    .map(loc => ({
      type: 'location' as const,
      item: { name: loc, type: 'location' as const }
    }));

    // Detect primary search intent
    let primaryType: 'product' | 'pharmacy' | 'location' | 'mixed' = 'mixed';

    if (locationMatches.length > 0 && stableProducts.length === 0 && stablePharmacies.length === 0) {
      primaryType = 'location';
    } else if (stableProducts.length > stablePharmacies.length && stableProducts.length > 0) {
      primaryType = 'product';
    } else if (stablePharmacies.length > stableProducts.length && stablePharmacies.length > 0) {
      primaryType = 'pharmacy';
    }

    // Organize results based on detected type
    if (primaryType === 'product' || primaryType === 'mixed') {
      // Add products first (sponsored ones already sorted at the top)
      stableProducts.forEach((product: any) => {
        results.push({
          type: 'product',
          item: product,
          sponsored: product.is_sponsored || false
        });
      });
    }

    if (primaryType === 'pharmacy' || primaryType === 'mixed') {
      // Add pharmacies
      stablePharmacies.forEach((pharmacy: Pharmacy) => {
        results.push({
          type: 'pharmacy',
          item: pharmacy
        });
      });
    }

    if (primaryType === 'location' || (primaryType === 'mixed' && locationMatches.length > 0)) {
      // Add locations
      results.push(...locationMatches);
    }

    return {
      searchResults: results.slice(0, 8), // Limit to 8 results
      detectedType: primaryType
    };
  }, [stableProducts, stablePharmacies, query]);

  // Update state only when computed values change - use refs to avoid unnecessary updates
  const prevResults = useRef<SearchResult[]>([]);
  const prevType = useRef<'product' | 'pharmacy' | 'location' | 'mixed'>('mixed');

  useEffect(() => {
    // Only update if results actually changed
    if (JSON.stringify(computedResults) !== JSON.stringify(prevResults.current) ||
        computedType !== prevType.current) {
      setSearchResults(computedResults);
      setDetectedType(computedType);
      prevResults.current = computedResults;
      prevType.current = computedType;
    }

    if (query.length < 1) {
      setSpellingSuggestions([]);
    }
  }, [computedResults, computedType, query]);

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

  // Initialize voice recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'fr-FR'; // French for pharmaceutical terms
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsOpen(true);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setVoiceError('Erreur de reconnaissance vocale');
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 1);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (query.length >= 1) {
      setIsOpen(true);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${detectedType}`);
      setIsOpen(false);
      setQuery('');
      onSelect?.();
    }
  };

  const handleSelectResult = (index: number) => {
    const result = searchResults[index];

    if (result.type === 'product') {
      const productName = (result.item as Product).name;
      // Navigate to search results for this product instead of product detail page
      router.push(`/search?q=${encodeURIComponent(productName)}&type=product`).then(() => {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        onSelect?.();
      });
    } else if (result.type === 'pharmacy') {
      const pharmacyName = (result.item as Pharmacy).name;
      // Navigate to search results for this pharmacy
      router.push(`/search?q=${encodeURIComponent(pharmacyName)}&type=pharmacy`).then(() => {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        onSelect?.();
      });
    } else if (result.type === 'location') {
      router.push(`/search?q=${encodeURIComponent(result.item.name)}&type=location`).then(() => {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(-1);
        onSelect?.();
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelectResult(selectedIndex);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Voice search handlers
  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!recognitionRef.current) {
      setVoiceError('Recherche vocale non supportée par ce navigateur');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      setVoiceError('Erreur lors du démarrage de la reconnaissance vocale');
      console.error('Voice recognition error:', error);
    }
  };

  // Image search handlers
  const handleImageSearch = () => {
    setIsImageModalOpen(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processImageFile(file);
  };

  const processImageFile = async (file: File) => {
    setIsProcessingImage(true);

    try {
      // Convertir l'image en base64 pour l'API Google Vision
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Enlever le préfixe data:image/...;base64,
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      });

      // Appel à notre API backend qui utilise Google Vision
      const response = await fetch('http://localhost:8000/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.detected_text;

      // Debug: Log du résultat OCR brut
      console.log('🔍 OCR Raw Text:', text);

      if (text.trim()) {
        // Nettoyage du texte OCR et extraction des termes pertinents
        const cleanedText = text
          .replace(/[^a-zA-Z\u00c0-\u00ff0-9\s]/g, ' ') // Remove special characters
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();

        console.log('🧹 Cleaned Text:', cleanedText);

        const words = cleanedText.split(' ').filter(word => word.length > 2);

        // Approche "Google" : Combiner TOUS les éléments pertinents
        const relevantTerms = {
          drugs: [],
          brands: [],
          dosages: [],
          forms: [],
          others: []
        };

        // Dictionnaires pharmaceutiques
        const commonDrugs = [
          'paracétamol', 'paracetamol', 'acetaminophen',
          'ibuprofène', 'ibuprofen', 'aspirine', 'aspirin',
          'amoxicilline', 'amoxicillin', 'azithromycine', 'azithromycin',
          'ciprofloxacine', 'ciprofloxacin', 'metronidazole',
          'oméprazole', 'omeprazole', 'pantoprazole',
          'loratadine', 'cetirizine', 'prednisolone',
          'salbutamol', 'dexamethasone', 'diclofenac',
          'metformine', 'metformin', 'atenolol', 'amlodipine'
        ];

        const brandNames = [
          'biogaran', 'sandoz', 'teva', 'mylan', 'arrow',
          'eg', 'zentiva', 'ratiopharm', 'pfizer', 'novartis',
          'sanofi', 'bayer', 'merck', 'gsk', 'roche'
        ];

        const pharmaceuticalForms = [
          'comprimé', 'comprimés', 'gélule', 'gélules', 'sirop',
          'injection', 'capsule', 'capsules', 'sachet', 'sachets',
          'crème', 'gel', 'pommade', 'lotion'
        ];

        // Classer chaque mot dans sa catégorie
        words.forEach(word => {
          const lowerWord = word.toLowerCase();

          // 1. Principes actifs (priorité haute)
          if (commonDrugs.some(drug =>
            lowerWord.includes(drug) || drug.includes(lowerWord)
          )) {
            relevantTerms.drugs.push(word);
          }
          // 2. Marques (utiles mais pas prioritaires)
          else if (brandNames.some(brand => lowerWord.includes(brand))) {
            relevantTerms.brands.push(word);
          }
          // 3. Dosages (mg, ml, g, etc.)
          else if (/\d+(mg|ml|g|mcg|ui|%)/i.test(lowerWord) ||
                   lowerWord.includes('mg') || lowerWord.includes('ml')) {
            relevantTerms.dosages.push(word);
          }
          // 4. Formes pharmaceutiques
          else if (pharmaceuticalForms.some(form => lowerWord.includes(form))) {
            relevantTerms.forms.push(word);
          }
          // 5. Autres mots longs (potentiels noms de médicaments)
          else if (word.length > 5 && !/^\d+$/.test(word)) {
            relevantTerms.others.push(word);
          }
        });

        // Construire une recherche comprehensive comme Google
        const searchComponents = [];

        // Ordre de priorité dans la recherche combinée
        if (relevantTerms.drugs.length > 0) {
          searchComponents.push(...relevantTerms.drugs.slice(0, 1)); // Principe actif principal
        }

        if (relevantTerms.brands.length > 0) {
          searchComponents.push(...relevantTerms.brands.slice(0, 1)); // Une marque
        }

        if (relevantTerms.dosages.length > 0) {
          searchComponents.push(...relevantTerms.dosages.slice(0, 1)); // Un dosage
        }

        // Si aucun principe actif trouvé, ajouter d'autres termes pertinents
        if (relevantTerms.drugs.length === 0) {
          if (relevantTerms.others.length > 0) {
            searchComponents.push(...relevantTerms.others.slice(0, 1));
          }
          if (relevantTerms.forms.length > 0) {
            searchComponents.push(...relevantTerms.forms.slice(0, 1));
          }
        }

        // Debug: Afficher la classification
        console.log('📊 Classification des termes:', {
          drugs: relevantTerms.drugs,
          brands: relevantTerms.brands,
          dosages: relevantTerms.dosages,
          forms: relevantTerms.forms,
          others: relevantTerms.others
        });

        console.log('🔧 Composants de recherche sélectionnés:', searchComponents);

        // Ajout de la forme pharmaceutique si détectée
        if (relevantTerms.forms.length > 0) {
          searchComponents.push(...relevantTerms.forms.slice(0, 1));
        }

        // Si aucun terme pharmaceutique spécifique, utiliser les autres termes détectés
        if (searchComponents.length === 0 && relevantTerms.others.length > 0) {
          searchComponents.push(...relevantTerms.others.slice(0, 2));
        }

        // Créer la recherche finale avec les termes détectés
        let searchTerm = searchComponents.slice(0, 4).join(' ').trim();

        // Si aucun terme spécifique détecté, utiliser le texte nettoyé directement
        if (!searchTerm && cleanedText.length > 0) {
          searchTerm = cleanedText.split(' ').slice(0, 3).join(' ').trim();
        }

        console.log('🎯 Terme de recherche final:', searchTerm);

        if (searchTerm) {
          setQuery(searchTerm);
          setIsOpen(true);
          setIsImageModalOpen(false);
        } else {
          alert('Aucun terme de recherche valide détecté dans l\'image.');
        }
      } else {
        alert('Aucun texte détecté dans l\'image. Essayez avec une image plus claire.');
      }

    } catch (error) {
      console.error('Error processing image:', error);
      alert('Erreur lors du traitement de l\'image. Veuillez réessayer.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const [exampleIndex, setExampleIndex] = useState(0);

  const examples = [
    '"Paracétamol" → Médicament',
    '"Pharmacie Centrale" → Pharmacie',
    '"Lomé" → Localité'
  ];

  // Rotate examples only on client side to avoid hydration mismatch
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleIndex(prev => (prev + 1) % examples.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [examples.length]);

  const getStyleClasses = () => {
    if (variant === 'compact') {
      return {
        input: "block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
        icon: "h-4 w-4 text-gray-400",
        iconContainer: "absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none"
      };
    }

    if (prominent) {
      return {
        input: "block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl leading-6 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-lg",
        icon: "h-6 w-6 text-gray-400",
        iconContainer: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
      };
    }

    return {
      input: "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm",
      icon: "h-5 w-5 text-gray-400",
      iconContainer: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
    };
  };

  const { input: inputClassName, icon: iconClassName, iconContainer: iconContainerClassName } = getStyleClasses();

  return (
    <div ref={searchRef} className={clsx("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className={iconContainerClassName}>
            <MagnifyingGlassIcon className={iconClassName} aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className={inputClassName}
          />

          {/* Voice and Image Search Buttons */}
          <div className={clsx(
            "absolute inset-y-0 right-0 flex items-center space-x-1",
            variant === 'compact' ? "pr-2" : prominent ? "pr-4" : "pr-3"
          )}>
            {/* Voice Search Button */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isLoading}
              className={clsx(
                "p-1 rounded-full hover:bg-gray-100 transition-colors",
                isListening && "bg-red-100 animate-pulse"
              )}
              title="Recherche vocale"
            >
              <MicrophoneIcon
                className={clsx(
                  variant === 'compact' ? "h-3.5 w-3.5" : prominent ? "h-5 w-5" : "h-4 w-4",
                  isListening ? "text-red-600" : "text-gray-400 hover:text-gray-600"
                )}
              />
            </button>

            {/* Image Search Button */}
            <button
              type="button"
              onClick={handleImageSearch}
              disabled={isLoading}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              title="Recherche par image"
            >
              <CameraIcon
                className={clsx(
                  variant === 'compact' ? "h-3.5 w-3.5" : prominent ? "h-5 w-5" : "h-4 w-4",
                  "text-gray-400 hover:text-gray-600"
                )}
              />
            </button>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="ml-2">
                <div className={clsx(
                  "animate-spin rounded-full border-b-2 border-primary-600",
                  variant === 'compact' ? "h-3.5 w-3.5" : prominent ? "h-5 w-5" : "h-4 w-4"
                )}></div>
              </div>
            )}
          </div>
        </div>
      </form>


      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 1) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
              Recherche intelligente en cours...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {/* Detection indicator */}
              <div className="px-3 py-2 bg-primary-50 border-b border-primary-100">
                <p className="text-xs text-primary-700">
                  {detectedType === 'product' && '💊 Médicaments détectés'}
                  {detectedType === 'pharmacy' && '🏥 Pharmacies détectées'}
                  {detectedType === 'location' && '📍 Localités détectées'}
                  {detectedType === 'mixed' && '🔍 Recherche mixte'}
                </p>
              </div>

              {/* Results organized by type */}
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${index}`}
                  type="button"
                  className={clsx(
                    "w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0",
                    selectedIndex === index && "bg-primary-50"
                  )}
                  onClick={() => handleSelectResult(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {result.type === 'product' && (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💊</span>
                            <p className="text-sm font-medium text-gray-900">
                              {(result.item as Product).name}
                            </p>
                            {result.sponsored && (result.item as any).sponsored_pharmacy && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Vendu par {(result.item as any).sponsored_pharmacy.name}
                              </span>
                            )}
                          </div>
                          {(result.item as Product).generic_name && (
                            <p className="text-xs text-gray-500 ml-7">
                              {(result.item as Product).generic_name}
                            </p>
                          )}
                          {(result.item as Product).manufacturer && (
                            <p className="text-xs text-gray-400 ml-7">
                              {(result.item as Product).manufacturer}
                            </p>
                          )}
                        </div>
                      )}

                      {result.type === 'pharmacy' && (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏥</span>
                            <p className="text-sm font-medium text-gray-900">
                              {(result.item as Pharmacy).name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 ml-7">
                            {(result.item as Pharmacy).address}
                          </p>
                          {(result.item as Pharmacy).phone && (
                            <p className="text-xs text-gray-400 ml-7">
                              {(result.item as Pharmacy).phone}
                            </p>
                          )}
                        </div>
                      )}

                      {result.type === 'location' && (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📍</span>
                            <p className="text-sm font-medium text-gray-900">
                              {result.item.name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 ml-7">
                            Localité au Togo
                          </p>
                        </div>
                      )}
                    </div>

                    {result.type === 'product' && (result.item as Product).requires_prescription && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-800">
                        Ordonnance
                      </span>
                    )}

                    {result.type === 'pharmacy' && (result.item as Pharmacy).is_verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800">
                        Vérifiée
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {/* View All Results */}
              <div className="border-t border-gray-200">
                <button
                  type="button"
                  className="w-full px-3 py-3 text-sm text-primary-600 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none font-medium"
                  onClick={handleSearch}
                >
                  Voir tous les résultats pour "{query}"
                  {detectedType !== 'mixed' && (
                    <span className="ml-1">
                      {detectedType === 'product' && '(Médicaments)'}
                      {detectedType === 'pharmacy' && '(Pharmacies)'}
                      {detectedType === 'location' && '(Localités)'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Aucun résultat trouvé pour "{query}"</p>
              {spellingSuggestions.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Peut-être cherchiez-vous :</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {spellingSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs hover:bg-primary-200 transition-colors"
                        onClick={() => {
                          setQuery(suggestion);
                          inputRef.current?.focus();
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Image Search Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recherche par image</h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {isProcessingImage ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyse de l'image en cours...</p>
                <p className="text-sm text-gray-500 mt-2">Extraction du texte médical</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Téléchargez une photo d'ordonnance, de boîte de médicament ou de tout document médical pour rechercher automatiquement.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition-colors"
                  >
                    <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Télécharger</span>
                    <span className="text-xs text-gray-500">depuis la galerie</span>
                  </button>

                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment');
                        fileInputRef.current.click();
                      }
                    }}
                    className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50 transition-colors"
                  >
                    <CameraIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Prendre photo</span>
                    <span className="text-xs text-gray-500">avec l'appareil</span>
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Formats supportés:</p>
                  <p>JPG, PNG, WebP • Max 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default UnifiedSearchBar;