import React, { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import PrescriptionUpload from './PrescriptionUpload';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    requires_prescription: boolean;
  };
  pharmacy: {
    id: string;
    name: string;
  };
  quantity?: number;
  className?: string;
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  pharmacy,
  quantity = 1,
  className = '',
  disabled = false
}) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);

  const handleAddToCart = async () => {
    // If product requires prescription, show upload modal
    if (product.requires_prescription) {
      if (!isAuthenticated) {
        // PrescriptionUpload component handles login redirect
        setShowPrescriptionUpload(true);
        return;
      }
      setShowPrescriptionUpload(true);
      return;
    }

    // For regular products, prompt login if not authenticated
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter des produits au panier');
      // Redirect to login page with current page as redirect
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }

    // Regular product - add directly to cart
    try {
      await addToCart(product.id, pharmacy.id, quantity);
      toast.success(`${product.name} ajouté au panier`);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Erreur lors de l\'ajout au panier';
      toast.error(message);
    }
  };

  const handlePrescriptionSuccess = (prescriptionRequestId: string) => {
    // Close modal and inform user
    setShowPrescriptionUpload(false);
    toast.success('Prescription envoyée ! Vous recevrez une notification lors de la validation.');

    // Optional: You could add the item to cart with prescription request ID
    // This would require updating the cart API to handle prescription items
  };

  const handlePrescriptionCancel = () => {
    setShowPrescriptionUpload(false);
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`
          flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors
          ${disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : product.requires_prescription
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }
          ${className}
        `}
      >
        <ShoppingCartIcon className="h-5 w-5 mr-2" />
        Ajouter au panier
      </button>

      {/* Prescription Upload Modal */}
      <PrescriptionUpload
        product={product}
        pharmacy={pharmacy}
        quantity={quantity}
        isOpen={showPrescriptionUpload}
        onSuccess={handlePrescriptionSuccess}
        onCancel={handlePrescriptionCancel}
      />
    </>
  );
};

export default AddToCartButton;