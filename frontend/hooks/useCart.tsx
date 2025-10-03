import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from './useAuth';

interface CartItem {
  id: string;
  product_id: string;
  pharmacy_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    generic_name?: string;
    dosage?: string;
    manufacturer?: string;
    requires_prescription: boolean;
  };
  pharmacy: {
    id: string;
    name: string;
    city?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  addToCart: (productId: string, pharmacyId: string, quantity?: number, productData?: any, pharmacyData?: any, price?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [localCart, setLocalCart] = useState<CartItem[]>([]);

  // Fetch cart items for authenticated users
  const {
    data: cartItems = [],
    isLoading,
    refetch,
  } = useQuery(
    ['cart', 'items'],
    () => api.cart.getItems().then(res => res.data),
    {
      enabled: isAuthenticated,
      retry: 1,
      staleTime: 60000, // 1 minute
      onError: (error) => {
        console.error('Failed to fetch cart items:', error);
      }
    }
  );

  // Use local cart for non-authenticated users, server cart for authenticated users
  const items = isAuthenticated ? cartItems : localCart;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load local cart from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('pharma_cart');
      if (savedCart) {
        try {
          setLocalCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
          localStorage.removeItem('pharma_cart');
        }
      }
    }
  }, [isAuthenticated]);

  // Save local cart to localStorage when it changes
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('pharma_cart', JSON.stringify(localCart));
    }
  }, [localCart, isAuthenticated]);

  // Sync local cart with server when user logs in
  useEffect(() => {
    const syncCartWithServer = async () => {
      if (isAuthenticated && localCart.length > 0) {
        try {
          // Add each local cart item to server cart
          for (const item of localCart) {
            try {
              await api.cart.addItem({
                product_id: item.product_id,
                pharmacy_id: item.pharmacy_id,
                quantity: item.quantity
              });
            } catch (error) {
              console.error('Failed to sync cart item to server:', error);
            }
          }

          // Clear local cart after successful sync
          setLocalCart([]);
          localStorage.removeItem('pharma_cart');

          // Refetch cart to get updated server data
          queryClient.invalidateQueries(['cart']);

          toast.success('Panier synchronisé !');
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
          toast.error('Erreur lors de la synchronisation du panier');
        }
      }
    };

    syncCartWithServer();
  }, [isAuthenticated, localCart, queryClient]);

  // Add to cart mutation with enhanced context
  const addToCartMutation = useMutation(
    async ({ productId, pharmacyId, quantity = 1, productData, pharmacyData, price }: {
      productId: string;
      pharmacyId: string;
      quantity?: number;
      productData?: any;
      pharmacyData?: any;
      price?: number;
    }) => {
      if (isAuthenticated) {
        return api.cart.addItem({ product_id: productId, pharmacy_id: pharmacyId, quantity });
      } else {
        // For non-authenticated users, use provided data or fetch if not available
        try {
          let product = productData;
          let pharmacy = pharmacyData;
          let itemPrice = price || 1000; // Default price

          // If data not provided, try to fetch from availability API
          if (!product || !pharmacy || !price) {
            try {
              const availabilityResponse = await api.products.getAvailability(productId);
              const availability = availabilityResponse.data.find(item => item.pharmacy_id === pharmacyId);

              if (availability) {
                itemPrice = availability.price;
                if (!product) {
                  // Create minimal product data from productId
                  product = {
                    id: productId,
                    name: 'Produit', // Will be updated when real data is available
                    requires_prescription: false
                  };
                }
                if (!pharmacy) {
                  pharmacy = {
                    id: pharmacyId,
                    name: availability.pharmacy_name,
                    city: null
                  };
                }
              }
            } catch (availabilityError) {
              console.warn('Could not fetch availability data:', availabilityError);
              // Use provided data or defaults
              if (!product) {
                product = {
                  id: productId,
                  name: 'Produit',
                  requires_prescription: false
                };
              }
              if (!pharmacy) {
                pharmacy = {
                  id: pharmacyId,
                  name: 'Pharmacie',
                  city: null
                };
              }
            }
          }

          const newItem: CartItem = {
            id: `local-${Date.now()}`,
            product_id: productId,
            pharmacy_id: pharmacyId,
            quantity,
            price: itemPrice,
            product: {
              id: product.id,
              name: product.name,
              generic_name: product.generic_name,
              dosage: product.dosage,
              manufacturer: product.manufacturer,
              requires_prescription: product.requires_prescription || false
            },
            pharmacy: {
              id: pharmacy.id,
              name: pharmacy.name,
              city: pharmacy.city
            }
          };

          // Check if item already exists in local cart
          setLocalCart(prev => {
            const existingItemIndex = prev.findIndex(
              item => item.product_id === productId && item.pharmacy_id === pharmacyId
            );

            if (existingItemIndex >= 0) {
              // Update quantity of existing item
              const updated = [...prev];
              updated[existingItemIndex] = {
                ...updated[existingItemIndex],
                quantity: updated[existingItemIndex].quantity + quantity
              };
              return updated;
            } else {
              // Add new item
              return [...prev, newItem];
            }
          });

          return Promise.resolve();
        } catch (error) {
          console.error('Failed to add item to local cart:', error);
          throw error;
        }
      }
    },
    {
      onSuccess: () => {
        if (isAuthenticated) {
          queryClient.invalidateQueries(['cart']);
        }
        toast.success('Produit ajouté au panier');
      },
      onError: (error: any) => {
        console.error('Add to cart error:', error);
        let message = 'Erreur lors de l\'ajout au panier';

        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            message = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            message = error.response.data.detail.map((err: any) => err.msg || err).join(', ');
          }
        }

        toast.error(message);
      }
    }
  );

  // Update quantity mutation
  const updateQuantityMutation = useMutation(
    ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (isAuthenticated) {
        return api.cart.updateItem(itemId, { quantity });
      } else {
        return new Promise<void>((resolve) => {
          setLocalCart(prev =>
            prev.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            )
          );
          resolve();
        });
      }
    },
    {
      onSuccess: () => {
        if (isAuthenticated) {
          queryClient.invalidateQueries(['cart']);
        }
        toast.success('Quantité mise à jour');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors de la mise à jour';
        toast.error(message);
      }
    }
  );

  // Remove from cart mutation
  const removeFromCartMutation = useMutation(
    (itemId: string) => {
      if (isAuthenticated) {
        return api.cart.removeItem(itemId);
      } else {
        return new Promise<void>((resolve) => {
          setLocalCart(prev => prev.filter(item => item.id !== itemId));
          resolve();
        });
      }
    },
    {
      onSuccess: () => {
        if (isAuthenticated) {
          queryClient.invalidateQueries(['cart']);
        }
        toast.success('Produit retiré du panier');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors de la suppression';
        toast.error(message);
      }
    }
  );

  // Clear cart mutation
  const clearCartMutation = useMutation(
    () => {
      if (isAuthenticated) {
        return api.cart.clear();
      } else {
        return new Promise<void>((resolve) => {
          setLocalCart([]);
          localStorage.removeItem('pharma_cart');
          resolve();
        });
      }
    },
    {
      onSuccess: () => {
        if (isAuthenticated) {
          queryClient.invalidateQueries(['cart']);
        }
        toast.success('Panier vidé');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors du vidage du panier';
        toast.error(message);
      }
    }
  );

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    isLoading: isAuthenticated ? isLoading : false,
    addToCart: (productId: string, pharmacyId: string, quantity?: number, productData?: any, pharmacyData?: any, price?: number) =>
      addToCartMutation.mutateAsync({ productId, pharmacyId, quantity, productData, pharmacyData, price }),
    updateQuantity: (itemId: string, quantity: number) =>
      updateQuantityMutation.mutateAsync({ itemId, quantity }),
    removeFromCart: (itemId: string) => removeFromCartMutation.mutateAsync(itemId),
    clearCart: () => clearCartMutation.mutateAsync(),
    refetch: () => refetch(),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};