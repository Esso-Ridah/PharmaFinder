import React, { useState } from 'react';
import {
  XMarkIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: {
    id: string;
    total: number;
    pharmacy: string;
    products: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  onPaymentSuccess: (paymentId: string) => void;
}

type PaymentMethod = 'mobile_money' | 'card' | 'cash';
type MobileMoneyProvider = 'mtn' | 'moov' | 'orange';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mobile_money');
  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentStatus('idle');
    setErrorMessage('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success/failure
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        setPaymentStatus('success');
        const paymentId = `PAY-${Date.now()}`;
        setTimeout(() => {
          onPaymentSuccess(paymentId);
          onClose();
        }, 2000);
      } else {
        setPaymentStatus('error');
        setErrorMessage('Le paiement a échoué. Veuillez réessayer.');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('Une erreur est survenue lors du paiement.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const isFormValid = () => {
    if (selectedMethod === 'mobile_money') {
      return phoneNumber.length >= 8;
    }
    if (selectedMethod === 'card') {
      return cardDetails.number.length >= 16 && 
             cardDetails.expiry.length >= 5 && 
             cardDetails.cvv.length >= 3 && 
             cardDetails.name.length >= 2;
    }
    return true; // Cash payment
  };

  const mobileMoneyProviders = [
    {
      id: 'mtn' as MobileMoneyProvider,
      name: 'MTN Mobile Money',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'moov' as MobileMoneyProvider,
      name: 'Moov Money',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'orange' as MobileMoneyProvider,
      name: 'Orange Money',
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Paiement de la commande
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Récapitulatif de commande</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commande #{orderDetails.id}</span>
                    <span className="text-gray-600">{orderDetails.pharmacy}</span>
                  </div>
                  {orderDetails.products.map((product, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">
                        {product.name} × {product.quantity}
                      </span>
                      <span className="text-gray-600">
                        {formatCurrency(product.price * product.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary-600">
                        {formatCurrency(orderDetails.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              {paymentStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-green-900">Paiement réussi !</h4>
                      <p className="text-sm text-green-700">
                        Votre paiement a été traité avec succès. Vous allez être redirigé...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-red-900">Erreur de paiement</h4>
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Méthode de paiement</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedMethod('mobile_money')}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedMethod === 'mobile_money'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DevicePhoneMobileIcon className="h-6 w-6 text-gray-600 mb-2" />
                    <div className="font-medium text-gray-900">Mobile Money</div>
                    <div className="text-sm text-gray-500">MTN, Moov, Orange</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedMethod === 'card'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCardIcon className="h-6 w-6 text-gray-600 mb-2" />
                    <div className="font-medium text-gray-900">Carte bancaire</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard</div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('cash')}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedMethod === 'cash'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <BanknotesIcon className="h-6 w-6 text-gray-600 mb-2" />
                    <div className="font-medium text-gray-900">Espèces</div>
                    <div className="text-sm text-gray-500">Paiement à la livraison</div>
                  </button>
                </div>
              </div>

              {/* Payment Forms */}
              <div className="mb-6">
                {selectedMethod === 'mobile_money' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opérateur
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {mobileMoneyProviders.map((provider) => (
                          <button
                            key={provider.id}
                            onClick={() => setSelectedProvider(provider.id)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              selectedProvider === provider.id
                                ? `border-primary-500 ${provider.bgColor}`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`text-xs font-medium ${provider.textColor}`}>
                              {provider.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+228 XX XX XX XX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        placeholder="JOHN DOE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'cash' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <BanknotesIcon className="h-6 w-6 text-yellow-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Paiement en espèces</h4>
                        <p className="text-sm text-yellow-700">
                          Vous paierez en espèces lors de la livraison ou du retrait en pharmacie.
                          Préparez l'appoint : {formatCurrency(orderDetails.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={processing}
                  className="flex-1 btn-outline"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing || !isFormValid() || paymentStatus === 'success'}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </div>
                  ) : paymentStatus === 'success' ? (
                    'Paiement réussi'
                  ) : (
                    `Payer ${formatCurrency(orderDetails.total)}`
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;