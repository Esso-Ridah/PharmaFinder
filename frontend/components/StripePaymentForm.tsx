import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  amount: number;
  isProcessing?: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onSuccess,
  onError,
  amount,
  isProcessing = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Une erreur est survenue lors du paiement');
        toast.error(error.message || 'Erreur de paiement');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
        toast.success('Paiement réussi !');
      }
    } catch (err: any) {
      onError(err.message || 'Une erreur est survenue');
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCardIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informations de paiement
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Montant total</p>
            <p className="text-2xl font-bold text-primary-600">{amount.toLocaleString()} FCFA</p>
          </div>
        </div>

        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700">
              <strong>Mode test :</strong> Utilisez la carte de test <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Date d'expiration : n'importe quelle date future • CVC : n'importe quel 3 chiffres
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || isProcessing}
        className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading || isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Traitement en cours...
          </span>
        ) : (
          `Payer ${amount.toLocaleString()} FCFA`
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        Paiement sécurisé par Stripe • Vos informations sont protégées
      </p>
    </form>
  );
};

export default StripePaymentForm;
