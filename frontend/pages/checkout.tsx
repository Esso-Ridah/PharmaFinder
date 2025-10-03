import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  CheckIcon,
  TruckIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { api } from '../lib/api';
import AddressInput from '../components/AddressInput';
import StripePaymentForm from '../components/StripePaymentForm';
import toast from 'react-hot-toast';

// Initialize Stripe
let stripePromise: Promise<any> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

interface PharmacyGroup {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address: string;
  items: any[];
  total_price: number;
  delivery_fee: number;
}

interface DeliveryValidation {
  is_valid: boolean;
  delivery_type: string;
  pharmacy_groups: PharmacyGroup[];
  total_deliveries: number;
  total_delivery_fees: number;
  warnings: string[];
  suggestions: any[];
  requires_duplication?: boolean;
}

interface AddressData {
  label: string;
  address_type: 'modern' | 'description' | 'gps';
  street_address?: string;
  neighborhood?: string;
  city: string;
  landmark_description?: string;
  latitude?: number;
  longitude?: number;
  delivery_phone?: string;
  delivery_instructions?: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [validation, setValidation] = useState<DeliveryValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryAddress, setDeliveryAddress] = useState<AddressData>({
    label: 'Nouvelle adresse',
    address_type: 'modern',
    city: 'Abidjan',
    delivery_phone: ''
  });
  const [showDistanceWarning, setShowDistanceWarning] = useState(false);
  const [distanceWarnings, setDistanceWarnings] = useState<string[]>([]);
  const [userConfirmedDistance, setUserConfirmedDistance] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  useEffect(() => {
    if (items.length > 0) {
      validateDelivery(deliveryType);
    }
  }, [deliveryType, items]);

  const validateDelivery = async (type: string) => {
    setIsValidating(true);
    try {
      const response = await api.cart.validateDelivery({ delivery_type: type });
      setValidation(response.data);

      // Check for distance/city warnings
      const warnings = response.data.warnings || [];
      const distanceWarnings = warnings.filter(warning =>
        warning.includes('⚠️') || warning.includes('📍') || warning.includes('distance') || warning.includes('villes différentes')
      );

      if (distanceWarnings.length > 0 && !userConfirmedDistance) {
        setDistanceWarnings(distanceWarnings);
        setShowDistanceWarning(true);
      }
    } catch (error) {
      console.error('Failed to validate delivery:', error);
      toast.error('Erreur lors de la validation de livraison');
    } finally {
      setIsValidating(false);
    }
  };

  const initializeStripePayment = async () => {
    setIsLoading(true);
    try {
      // Create Stripe PaymentIntent first (without orders)
      const totalWithDelivery = (validation?.pharmacy_groups.reduce((sum, group) => sum + group.total_price, 0) || totalPrice) + (validation?.total_delivery_fees || 0);
      const paymentIntentResponse = await api.payments.createPaymentIntent({
        amount: totalWithDelivery,
        currency: 'xof',
        metadata: {
          user_id: user?.id,
          delivery_type: deliveryType,
          total_pharmacies: validation?.total_deliveries || 1
        }
      });

      setClientSecret(paymentIntentResponse.data.client_secret);
      toast.success('Prêt pour le paiement');
    } catch (error: any) {
      console.error('Failed to initialize payment:', error);
      let errorMessage = 'Erreur lors de l\'initialisation du paiement';

      if (error.response?.data?.detail) {
        // Handle Pydantic validation errors (array of objects)
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setIsProcessingPayment(true);
    try {
      // Create delivery address if needed
      let deliveryAddressId = null;
      if (deliveryType === 'home_delivery') {
        let addressString = '';
        if (deliveryAddress.address_type === 'modern') {
          addressString = [
            deliveryAddress.street_address,
            deliveryAddress.neighborhood,
            deliveryAddress.city
          ].filter(Boolean).join(', ');
        } else if (deliveryAddress.address_type === 'description') {
          addressString = `${deliveryAddress.landmark_description}, ${deliveryAddress.city}`;
        } else if (deliveryAddress.address_type === 'gps') {
          addressString = `Position GPS: ${deliveryAddress.latitude}, ${deliveryAddress.longitude} - ${deliveryAddress.city}`;
        }

        const addressData = {
          ...deliveryAddress,
          address: addressString || `${deliveryAddress.city} (${deliveryAddress.address_type})`
        };

        const addressResponse = await api.addresses.create(addressData);
        deliveryAddressId = addressResponse.data.id;
      }

      // Create orders with payment confirmation
      const response = await api.cart.createMultiOrder({
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        address_id: deliveryAddressId,
        notes: validation?.requires_duplication
          ? `Commande multiple - ${validation.total_deliveries} pharmacies - Paiement: ${paymentIntentId}`
          : `Paiement: ${paymentIntentId}`
      });

      // Extract order IDs/numbers safely
      let createdOrderIds: string[] = [];
      if (response.data.orders && Array.isArray(response.data.orders)) {
        createdOrderIds = response.data.orders
          .map((order: any) => (order.id || order.order_number)?.toString())
          .filter((id: string | undefined) => id !== undefined) as string[];
      }

      console.log('📦 Created orders:', response.data.orders);
      console.log('🔑 Extracted order IDs:', createdOrderIds);

      // Ensure we have at least one order ID
      if (createdOrderIds.length === 0) {
        console.error('No order IDs found in response:', response.data);
        throw new Error('Aucune commande créée');
      }

      // Confirm payment with backend
      await api.payments.confirmPayment({
        payment_intent_id: paymentIntentId,
        order_ids: createdOrderIds
      });

      // Note: Cart is already cleared by create-multi-order endpoint
      toast.success('Paiement effectué avec succès !');

      // Close modal and redirect
      setShowPaymentModal(false);
      router.push('/order-confirmation');
    } catch (error: any) {
      console.error('Failed to confirm payment:', error);
      let errorMessage = 'Erreur lors de la confirmation du paiement';

      if (error.response?.data?.detail) {
        // Handle Pydantic validation errors (array of objects)
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleStripePaymentError = (error: string) => {
    toast.error(error);
    setIsProcessingPayment(false);
  };

  const handlePlaceOrder = async () => {
    if (!validation?.is_valid) {
      toast.error('Veuillez résoudre les problèmes de livraison avant de continuer');
      return;
    }

    // Validate delivery address for home delivery
    if (deliveryType === 'home_delivery') {
      if (!deliveryAddress.city || !deliveryAddress.delivery_phone) {
        toast.error('Veuillez remplir la ville et le téléphone de livraison');
        return;
      }

      // Validate based on address type
      if (deliveryAddress.address_type === 'modern' && !deliveryAddress.street_address && !deliveryAddress.neighborhood) {
        toast.error('Veuillez remplir au moins le quartier ou l\'adresse complète');
        return;
      }

      if (deliveryAddress.address_type === 'description' && !deliveryAddress.landmark_description) {
        toast.error('Veuillez décrire votre localisation avec des points de repère');
        return;
      }

      if (deliveryAddress.address_type === 'gps' && (!deliveryAddress.latitude || !deliveryAddress.longitude)) {
        toast.error('Veuillez partager votre position GPS');
        return;
      }
    }

    // Open payment modal directly
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    // If card payment is selected, initialize Stripe if not already done
    if (paymentMethod === 'card' && !clientSecret) {
      await initializeStripePayment();
      return;
    }

    setIsLoading(true);
    try {
      let deliveryAddressId = null;

      // Create delivery address if home delivery
      if (deliveryType === 'home_delivery') {
        try {
          // Build address string based on type
          let addressString = '';
          if (deliveryAddress.address_type === 'modern') {
            addressString = [
              deliveryAddress.street_address,
              deliveryAddress.neighborhood,
              deliveryAddress.city
            ].filter(Boolean).join(', ');
          } else if (deliveryAddress.address_type === 'description') {
            addressString = `${deliveryAddress.landmark_description}, ${deliveryAddress.city}`;
          } else if (deliveryAddress.address_type === 'gps') {
            addressString = `Position GPS: ${deliveryAddress.latitude}, ${deliveryAddress.longitude} - ${deliveryAddress.city}`;
          }

          const addressData = {
            ...deliveryAddress,
            address: addressString || `${deliveryAddress.city} (${deliveryAddress.address_type})`
          };

          const addressResponse = await api.addresses.create(addressData);
          deliveryAddressId = addressResponse.data.id;
          toast.success('Adresse de livraison enregistrée');
        } catch (addressError) {
          console.error('Error creating address:', addressError);
          toast.error('Erreur lors de la création de l\'adresse');
          setIsLoading(false);
          return;
        }
      }

      if (validation?.requires_duplication) {
        // Create multiple orders (one per pharmacy)
        const response = await api.cart.createMultiOrder({
          delivery_type: deliveryType,
          payment_method: paymentMethod,
          address_id: deliveryAddressId,
          notes: `Commande multiple - ${validation.total_deliveries} pharmacies`
        });

        toast.success(`${validation.total_deliveries} commandes créées avec succès !`);

        // Clear cart after successful order
        await clearCart();

        // Close modal and redirect
        setShowPaymentModal(false);
        router.push('/order-confirmation');
      } else {
        // Single order - simulate for now
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear cart after successful order
        await clearCart();

        toast.success('Commande passée avec succès !');

        // Close modal and redirect
        setShowPaymentModal(false);
        router.push('/order-confirmation');
      }
    } catch (error: any) {
      console.error('Failed to place order:', error);
      let errorMessage = 'Erreur lors de la commande';

      if (error.response?.data?.detail) {
        // Handle Pydantic validation errors (array of objects)
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      }

      toast.error(errorMessage);
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

  const canPlaceOrder = validation?.is_valid || (validation && deliveryType === 'home_delivery');
  const totalWithDelivery = (validation?.pharmacy_groups.reduce((sum, group) => sum + group.total_price, 0) || totalPrice) + (validation?.total_delivery_fees || 0);

  return (
    <>
      <Head>
        <title>Finaliser la commande - PharmaFinder</title>
        <meta name="description" content="Finalisez votre commande" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Finaliser la commande</h1>
            <p className="text-gray-600 mt-2">Vérifiez votre commande et choisissez votre mode de livraison</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Type Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mode de livraison</h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="pickup"
                      name="delivery"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="pickup" className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Retrait en pharmacie (Gratuit)</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="home_delivery"
                      name="delivery"
                      value="home_delivery"
                      checked={deliveryType === 'home_delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="home_delivery" className="flex items-center">
                      <TruckIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Livraison à domicile (2,000 FCFA par pharmacie)</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Address - Only show for home delivery */}
                {deliveryType === 'home_delivery' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      📍 Adresse de livraison
                    </h3>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <AddressInput
                        onAddressChange={setDeliveryAddress}
                        initialAddress={deliveryAddress}
                      />
                    </div>
                  </div>
                )}

                {/* Validation Messages */}
                {isValidating ? (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm text-blue-800">Validation en cours...</span>
                    </div>
                  </div>
                ) : validation && validation.warnings.length > 0 && (
                  <div className="mt-6">
                    {validation.warnings
                      .filter(warning =>
                        !warning.includes('⚠️') && !warning.includes('📍') &&
                        !warning.includes('distance') && !warning.includes('villes différentes')
                      )
                      .map((warning, index) => (
                      <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Attention</p>
                            <p className="text-sm text-yellow-700 mt-1">{warning}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Success Message */}
                {validation && validation.is_valid && validation.warnings.length === 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Configuration valide</p>
                        <p className="text-sm text-green-700 mt-1">
                          Votre commande peut être traitée avec le mode de livraison sélectionné.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pharmacy Groups */}
              {validation && validation.pharmacy_groups.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Récapitulatif par pharmacie ({validation.total_deliveries} pharmacie{validation.total_deliveries > 1 ? 's' : ''})
                  </h2>

                  <div className="space-y-6">
                    {validation.pharmacy_groups.map((group, groupIndex) => (
                      <div key={group.pharmacy_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{group.pharmacy_name}</h3>
                            <p className="text-sm text-gray-500">{group.pharmacy_address}</p>
                          </div>
                          {deliveryType === 'home_delivery' && group.delivery_fee > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Frais de livraison</p>
                              <p className="text-sm font-medium text-gray-900">
                                {group.delivery_fee.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {group.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.product_name}</h4>
                                <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.total_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Sous-total pharmacie</span>
                            <span className="text-sm font-bold text-gray-900">
                              {group.total_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Total de la commande</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total produits</span>
                    <span>{(validation?.pharmacy_groups.reduce((sum, group) => sum + group.total_price, 0) || totalPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                  </div>

                  {validation && validation.total_delivery_fees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Frais de livraison ({validation.total_deliveries} livraison{validation.total_deliveries > 1 ? 's' : ''})</span>
                      <span>{validation.total_delivery_fees.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{totalWithDelivery.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !canPlaceOrder}
                    className={`w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white ${
                      canPlaceOrder && !isLoading
                        ? 'bg-primary-600 hover:bg-primary-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
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

        {/* Distance Warning Modal */}
        {showDistanceWarning && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  Avertissement de distance
                </h3>
                <div className="mt-4 px-4 py-2">
                  <div className="text-sm text-gray-600 space-y-2">
                    {distanceWarnings.map((warning, index) => (
                      <p key={index} className="text-left">
                        {warning}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Attention:</strong> Vos produits proviennent de pharmacies éloignées ou dans des villes différentes.
                      Cela pourrait compliquer le retrait ou augmenter les frais de livraison.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDistanceWarning(false);
                      // Return to cart to allow user to modify their selection
                      router.push('/cart');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Modifier mon panier
                  </button>
                  <button
                    onClick={() => {
                      setUserConfirmedDistance(true);
                      setShowDistanceWarning(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Continuer ma commande
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-900">Paiement</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setClientSecret(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {/* Order Summary */}
              {validation?.requires_duplication && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Commandes multiples</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Vos produits proviennent de {validation.total_deliveries} pharmacies différentes.
                        Nous allons créer {validation.total_deliveries} commandes séparées, mais vous ne paierez qu'une seule fois.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total à payer</span>
                  <span>{((validation?.pharmacy_groups.reduce((sum, group) => sum + group.total_price, 0) || totalPrice) + (validation?.total_delivery_fees || 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choisissez votre mode de paiement</h3>
                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'card'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      id="card-modal"
                      name="payment-modal"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="card-modal" className="flex items-center ml-3 flex-1 cursor-pointer">
                      <CreditCardIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Carte bancaire</span>
                    </label>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('mobile_money')}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'mobile_money'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      id="mobile-modal"
                      name="payment-modal"
                      value="mobile_money"
                      checked={paymentMethod === 'mobile_money'}
                      onChange={() => setPaymentMethod('mobile_money')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="mobile-modal" className="flex items-center ml-3 flex-1 cursor-pointer">
                      <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">Mobile Money</span>
                    </label>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'paypal'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      id="paypal-modal"
                      name="payment-modal"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="paypal-modal" className="flex items-center ml-3 flex-1 cursor-pointer">
                      <CreditCardIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">PayPal</span>
                    </label>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === 'cash'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      id="cash-modal"
                      name="payment-modal"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <label htmlFor="cash-modal" className="flex items-center ml-3 flex-1 cursor-pointer">
                      <BanknotesIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">
                        Espèces ({deliveryType === 'pickup' ? 'en pharmacie' : 'à la livraison'})
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Form Based on Selection */}
              <div className="mb-6">
                {paymentMethod === 'card' && clientSecret && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de carte</h3>
                    <Elements stripe={getStripe()} options={{ clientSecret }}>
                      <StripePaymentForm
                        onSuccess={handleStripePaymentSuccess}
                        onError={handleStripePaymentError}
                        amount={(validation?.pharmacy_groups.reduce((sum, group) => sum + group.total_price, 0) || totalPrice) + (validation?.total_delivery_fees || 0)}
                        isProcessing={isProcessingPayment}
                      />
                    </Elements>
                  </div>
                )}

                {paymentMethod === 'mobile_money' && (
                  <div className="border-t pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Le paiement Mobile Money sera bientôt disponible. En attendant, vous pouvez payer en espèces.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="border-t pt-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Le paiement PayPal sera bientôt disponible. En attendant, vous pouvez payer par carte ou en espèces.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="border-t pt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-medium mb-2">
                        ✓ Paiement en espèces {deliveryType === 'pickup' ? 'en pharmacie' : 'à la livraison'}
                      </p>
                      <p className="text-sm text-green-700">
                        {deliveryType === 'pickup'
                          ? 'Vous paierez directement en pharmacie lors du retrait de votre commande.'
                          : 'Vous paierez au livreur lors de la réception de votre commande.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            {!clientSecret && (
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between rounded-b-lg">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setClientSecret(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md text-sm font-medium text-white ${
                    isLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Traitement...
                    </>
                  ) : paymentMethod === 'card' ? (
                    'Continuer vers le paiement'
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;