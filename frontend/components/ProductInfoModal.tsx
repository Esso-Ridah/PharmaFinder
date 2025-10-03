import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product } from '../lib/api';
import { useCart } from '../hooks/useCart';
import AddToCartButton from './AddToCartButton';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ isOpen, onClose, product }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = async (pharmacyId: string) => {
    setAddingToCart(pharmacyId);
    try {
      // Extract pharmacy data if available from product's sponsored_pharmacy
      const pharmacyData = product.sponsored_pharmacy ? {
        id: product.sponsored_pharmacy.id,
        name: product.sponsored_pharmacy.name,
        city: null
      } : null;

      await addToCart(
        product.id,
        pharmacyId,
        1,
        product, // Pass complete product data
        pharmacyData, // Pass pharmacy data if available
        product.min_price // Pass the price from product data
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Fiche produit
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Product Name and Basic Info */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h4>
            {product.generic_name && (
              <p className="text-lg text-gray-600 mb-2">
                {product.generic_name}
              </p>
            )}
            {product.manufacturer && (
              <p className="text-sm text-gray-500">
                Fabriqué par {product.manufacturer}
              </p>
            )}
          </div>

          {/* Prescription Warning */}
          {product.requires_prescription && (
            <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-500 mr-2" />
                <span className="text-sm font-medium text-warning-800">
                  Médicament sur ordonnance
                </span>
              </div>
              <p className="mt-1 text-xs text-warning-700">
                Ce médicament nécessite une prescription médicale valide.
              </p>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.dosage && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {product.dosage}
              </span>
            )}
            {product.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {product.active_ingredient && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Principe actif</h5>
                <p className="text-sm text-gray-700">{product.active_ingredient}</p>
              </div>
            )}

            {product.description && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
                <p className="text-sm text-gray-700">{product.description}</p>
              </div>
            )}

            {product.contraindications && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Contre-indications</h5>
                <p className="text-sm text-gray-700">{product.contraindications}</p>
              </div>
            )}

            {product.side_effects && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Effets secondaires</h5>
                <p className="text-sm text-gray-700">{product.side_effects}</p>
              </div>
            )}

            {/* Notice non disponible */}
            {!product.description && !product.contraindications && !product.side_effects && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Notice non disponible
                  </span>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Les informations détaillées sur ce médicament ne sont pas encore disponibles.
                </p>
                <div className="space-y-2 text-sm text-blue-700">
                  <p><strong>Nous vous recommandons de :</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Consulter votre pharmacien pour plus d'informations</li>
                    <li>Lire attentivement la notice du médicament</li>
                    <li>Respecter la posologie prescrite</li>
                    <li>Contacter un professionnel en cas de doute</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-outline btn-sm"
            >
              Fermer
            </button>
            {(product as any).sponsored_pharmacy ? (
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  requires_prescription: product.requires_prescription
                }}
                pharmacy={{
                  id: (product as any).sponsored_pharmacy.id,
                  name: (product as any).sponsored_pharmacy.name
                }}
                quantity={1}
                disabled={addingToCart === (product as any).sponsored_pharmacy.id}
                className="btn-primary btn-sm"
              />
            ) : (
              <button
                onClick={() => router.push(`/search?q=${encodeURIComponent(product.name)}&type=product`)}
                className="btn-primary btn-sm"
              >
                Voir les pharmacies
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoModal;