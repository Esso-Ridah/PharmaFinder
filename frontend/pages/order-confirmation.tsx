import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ReceiptPercentIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface OrderConfirmationProps {}

const OrderConfirmation: React.FC<OrderConfirmationProps> = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Données simulées pour la démo
  const mockOrderData = {
    userName: "Jean Dupont",
    userEmail: "test@exemple.com",
    orders: [
      {
        order_number: "ORD123456",
        pharmacy_name: "Pharmacie du Centre",
        delivery_type: "pickup",
        items_count: 2,
        subtotal: 8500,
        delivery_fee: 0,
        total_amount: 8500,
        pickup_code: "1234"
      },
      {
        order_number: "ORD123457",
        pharmacy_name: "Pharmacie de la Paix",
        delivery_type: "pickup",
        items_count: 1,
        subtotal: 3200,
        delivery_fee: 0,
        total_amount: 3200,
        pickup_code: "5678"
      }
    ],
    totalAmount: 11700
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Traitement de votre commande...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Commande confirmée - PharmaFinder</title>
        <meta name="description" content="Votre commande a été confirmée avec succès" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header avec logo et informations plateforme */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-2">
                💊 PharmaFinder
              </h1>
              <p className="text-blue-100">Votre pharmacie en ligne de confiance</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              🎉 Commande confirmée avec succès !
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Merci {mockOrderData.userName}, votre commande a été reçue et est en cours de traitement.
            </p>

            {/* Email Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Emails envoyés à {mockOrderData.userEmail}</span>
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm text-blue-600">
                <span className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Email de confirmation
                </span>
                <span className="flex items-center">
                  <ReceiptPercentIcon className="h-4 w-4 mr-1" />
                  Reçu détaillé
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">📋 Récapitulatif de la commande</h3>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{mockOrderData.orders.length}</div>
                <div className="text-sm text-gray-600">Commande{mockOrderData.orders.length > 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {mockOrderData.orders.reduce((sum, order) => sum + order.items_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Article{mockOrderData.orders.reduce((sum, order) => sum + order.items_count, 0) > 1 ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {mockOrderData.totalAmount.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* Orders Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">🏥 Détails par pharmacie</h4>
              {mockOrderData.orders.map((order, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-primary-600">
                        Commande #{order.order_number}
                      </h5>
                      <p className="text-gray-600">{order.pharmacy_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{order.total_amount.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-sm text-gray-500">{order.items_count} article{order.items_count > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {order.pickup_code && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm font-medium text-yellow-800">
                        🏪 Retrait en pharmacie - Code:
                        <span className="ml-2 font-mono bg-yellow-200 px-2 py-1 rounded">
                          {order.pickup_code}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-4">📞 Prochaines étapes</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                Vous recevrez un SMS/email de confirmation de préparation
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                Pour les retraits: présentez-vous avec votre code de retrait
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                Pour les livraisons: nous vous contacterons pour planifier
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                En cas de question: contactez-nous au +225 07 XX XX XX XX
              </li>
            </ul>
          </div>

          {/* Platform Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">📞 Informations de contact</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contact@pharmafinder.com</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-gray-600">+225 07 XX XX XX XX</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-gray-600">Abidjan, Côte d'Ivoire</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <GlobeAltIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium">Site web</p>
                    <p className="text-gray-600">https://pharmafinder.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/orders"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              📱 Suivre mes commandes
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              🏠 Retour à l'accueil
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} PharmaFinder. Tous droits réservés.<br/>
              Cet email a été envoyé automatiquement, veuillez ne pas y répondre.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default OrderConfirmation;