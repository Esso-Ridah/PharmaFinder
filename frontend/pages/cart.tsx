import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const CartPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading
  } = useCart();

  const [isClearing, setIsClearing] = useState(false);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      setIsClearing(true);
      try {
        await clearCart();
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/cart'));
      return;
    }
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-400" />
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Votre panier est vide</h1>
            <p className="mt-4 text-lg text-gray-600">
              Découvrez nos produits et ajoutez-les à votre panier pour continuer vos achats.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Mon Panier ({totalItems} {totalItems > 1 ? 'articles' : 'article'})
            </h1>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                {isClearing ? 'Suppression...' : 'Vider le panier'}
              </button>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center mt-4 text-primary-600 hover:text-primary-500"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Continuer les achats
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <li key={item.id} className="p-6 flex items-center space-x-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <div className="text-gray-400 text-sm font-medium">
                        {item.product.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      {item.product.generic_name && (
                        <p className="text-sm text-gray-500">
                          {item.product.generic_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {item.product.dosage} - {item.product.manufacturer}
                      </p>
                      <p className="text-sm text-gray-500">
                        Pharmacie: {item.pharmacy.name}
                      </p>
                      <p className="text-lg font-medium text-gray-900 mt-2">
                        {item.price.toFixed(2)} FCFA
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <MinusIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <PlusIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} FCFA
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 lg:mt-0 lg:col-span-5">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Résumé de la commande
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-base text-gray-600">
                    Sous-total ({totalItems} {totalItems > 1 ? 'articles' : 'article'})
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    {totalPrice.toFixed(2)} FCFA
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-base text-gray-600">Livraison</span>
                  <span className="text-base font-medium text-gray-900">
                    Calculée à l'étape suivante
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-medium text-gray-900">
                      {totalPrice.toFixed(2)} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Passer à la commande
              </button>

              {!isAuthenticated && (
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Vous devez être connecté pour passer commande
                </p>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                >
                  ou continuer les achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;