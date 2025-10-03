import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, Transition } from '@headlessui/react';
import {
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CartDropdown: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
        toast.error('Erreur lors du vidage du panier');
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      const currentPath = router.asPath;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    router.push('/checkout');
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
        <span className="sr-only">Panier</span>
        <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary-600 rounded-full min-w-[18px]">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[80vh] flex flex-col">
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Mon Panier ({totalItems})
              </h3>
              {items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Vider
                </button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Votre panier est vide</p>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/search"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Continuer vos achats
                  </Link>
                )}
              </Menu.Item>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto min-h-0 max-h-60">
                {items.map((item) => (
                  <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {item.pharmacy.name}
                        </p>
                        {item.product.dosage && (
                          <p className="text-xs text-gray-400">{item.product.dosage}</p>
                        )}
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {(item.price * item.quantity).toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'XOF'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="px-2 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {totalPrice.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'XOF'
                    })}
                  </span>
                </div>

                <div className="space-y-2">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/cart"
                        className="w-full flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Voir le panier
                      </Link>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleCheckout}
                        className="w-full flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        {isAuthenticated ? 'Commander' : 'Se connecter pour commander'}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </div>
            </>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default CartDropdown;