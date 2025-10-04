import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import {
  ShoppingCartIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TruckIcon,
  UserCircleIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { api } from '../../../lib/api';
import PaymentModal from '../../../components/PaymentModal';

const ProductOrderPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lomé',
    notes: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery(
    ['product', id],
    () => api.products.getById(id as string).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch product availability in pharmacies
  const { data: availability = [], isLoading: availabilityLoading } = useQuery(
    ['product-availability', id],
    () => api.products.getAvailability(id as string).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const isLoading = productLoading || availabilityLoading;

  const handleSubmitOrder = async () => {
    if (!selectedPharmacy || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (deliveryType === 'delivery' && !customerInfo.address) {
      alert('Veuillez renseigner votre adresse de livraison');
      return;
    }

    // Open payment modal instead of direct confirmation
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    // Here you would typically save the order with the payment ID
    console.log('Payment successful:', paymentId);
    setShowPaymentModal(false);
    setShowConfirmation(true);
  };

  const selectedPharmacyData = availability.find(a => a.pharmacy_id === selectedPharmacy);
  const estimatedPrice = selectedPharmacyData?.price || 0;
  const deliveryFee = deliveryType === 'delivery' ? 1500 : 0;
  const totalPrice = (estimatedPrice * quantity) + deliveryFee;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Produit non trouvé</h2>
          <Link href="/products" className="mt-4 btn-primary inline-block">
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <>
        <Head>
          <title>Commande confirmée - {product.name} - PharmaFinder</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
            <p className="text-gray-600 mb-6">
              Votre commande a été envoyée à la pharmacie. Vous recevrez bientôt un SMS de confirmation avec les détails de préparation.
            </p>
            <div className="space-y-3">
              <Link href="/products" className="btn-primary w-full">
                Continuer mes achats
              </Link>
              <Link href="/" className="btn-outline w-full">
                Retour à l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Commander {product.name} - PharmaFinder</title>
        <meta name="description" content={`Commandez ${product.name} dans nos pharmacies partenaires`} />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-primary-600 hover:text-primary-700">
                ← Retour aux produits
              </Link>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">Commande de {product.name}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Résumé du produit</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    {product.generic_name && (
                      <p className="text-sm text-gray-500">{product.generic_name}</p>
                    )}
                    {product.dosage && (
                      <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {product.dosage}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                {product.requires_prescription && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Ordonnance médicale obligatoire pour ce produit
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pharmacy Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Choisir une pharmacie</h2>
                
                {availability.length === 0 ? (
                  <div className="text-center py-6">
                    <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Ce produit n'est actuellement disponible dans aucune pharmacie.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availability.map((item) => (
                      <label
                        key={item.pharmacy.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPharmacy === item.pharmacy.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pharmacy"
                          value={item.pharmacy.id}
                          checked={selectedPharmacy === item.pharmacy.id}
                          onChange={(e) => setSelectedPharmacy(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.pharmacy.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {item.pharmacy.address}
                            </p>
                            {item.pharmacy.phone && (
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {item.pharmacy.phone}
                              </p>
                            )}
                            <div className="flex items-center mt-2 space-x-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.stock > 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : item.stock > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {item.stock > 0 ? `${item.stock} en stock` : 'Rupture de stock'}
                              </span>
                              {item.pharmacy.is_verified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Vérifiée
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-semibold text-gray-900">
                              {item.price.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-gray-500">l'unité</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Type */}
              {selectedPharmacy && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Mode de récupération</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={deliveryType === 'pickup'}
                        onChange={(e) => setDeliveryType(e.target.value as 'pickup' | 'delivery')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <ClockIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-900">Retrait en pharmacie</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Gratuit • Prêt en 30 minutes
                        </p>
                      </div>
                    </label>

                    <label className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="delivery"
                        checked={deliveryType === 'delivery'}
                        onChange={(e) => setDeliveryType(e.target.value as 'pickup' | 'delivery')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <TruckIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-900">Livraison à domicile</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          1,500 FCFA • Sous 2 heures
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              {selectedPharmacy && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+228 XX XX XX XX"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {deliveryType === 'delivery' && (
                      <>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse de livraison <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                            placeholder="Adresse complète avec points de repère"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optionnel)
                      </label>
                      <textarea
                        rows={2}
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                        placeholder="Instructions particulières pour la pharmacie"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {selectedPharmacy && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{product.name} × {quantity}</span>
                      <span className="font-medium">{(estimatedPrice * quantity).toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {deliveryType === 'delivery' ? 'Livraison' : 'Retrait'}
                      </span>
                      <span className="font-medium">
                        {deliveryType === 'delivery' ? '1,500 FCFA' : 'Gratuit'}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>{totalPrice.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Pharmacie sélectionnée</h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{selectedPharmacyData?.pharmacy.name}</p>
                      <p>{selectedPharmacyData?.pharmacy.address}</p>
                      {selectedPharmacyData?.pharmacy.phone && (
                        <p className="flex items-center mt-1">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {selectedPharmacyData.pharmacy.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={!selectedPharmacy || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.phone}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Procéder au paiement
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Mobile Money • Carte bancaire • Espèces
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {product && selectedPharmacyData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderDetails={{
            id: `CMD-${Date.now()}`,
            total: totalPrice,
            pharmacy: selectedPharmacyData.pharmacy.name,
            products: [{
              name: product.name,
              quantity: quantity,
              price: estimatedPrice,
            }],
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default ProductOrderPage;