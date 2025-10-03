import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { CheckIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import Header from '../components/Header';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }
  }, [isAuthenticated, items, router]);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart after successful order
      await clearCart();

      toast.success('Commande passée avec succès !');
      router.push('/orders');
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Erreur lors de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Finaliser la commande - PharmaFinder</title>
        <meta name="description" content="Finalisez votre commande" />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
            <p className="text-gray-600 mt-2">Vérifiez votre commande avant de confirmer</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Récapitulatif de la commande</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">{item.pharmacy.name}</p>
                        {item.product.dosage && (
                          <p className="text-xs text-gray-400">{item.product.dosage}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Quantité: {item.quantity}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'XOF'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de livraison</h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pickup"
                      name="delivery"
                      defaultChecked
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="pickup" className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Retrait en pharmacie</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="delivery"
                      name="delivery"
                      disabled
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="delivery" className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-400">Livraison à domicile (bientôt disponible)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Total de la commande</h2>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frais de retrait</span>
                    <span>Gratuit</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Confirmer la commande
                      </>
                    )}
                  </button>

                  <Link
                    href="/cart"
                    className="w-full flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Retour au panier
                  </Link>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  <p>En confirmant cette commande, vous acceptez nos conditions générales de vente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;