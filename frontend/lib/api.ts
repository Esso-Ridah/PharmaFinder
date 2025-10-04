import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Base API configuration - use Next.js API routes to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },
  
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  },
  
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      tokenManager.removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 500) {
      // Server error
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    } else if (error.code === 'NETWORK_ERROR') {
      // Network error
      toast.error('Erreur de connexion. Vérifiez votre connexion internet.');
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  results: T[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'client' | 'pharmacist' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'client' | 'pharmacist';
}

export interface LoginCredentials {
  username: string; // email
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  generic_name?: string;
  barcode?: string;
  category_id?: string;
  description?: string;
  manufacturer?: string;
  dosage?: string;
  requires_prescription: boolean;
  active_ingredient?: string;
  contraindications?: string;
  side_effects?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  // Enhanced fields with sponsoring
  min_price?: number;
  is_sponsored?: boolean;
  sponsor_rank?: number;
  sponsored_pharmacy?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    phone?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductAvailability {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address: string;
  pharmacy_phone?: string;
  latitude?: number;
  longitude?: number;
  quantity: number;
  price: number;
  expiry_date?: string;
  last_updated: string;
}

// Pharmacy types
export interface Pharmacy {
  id: string;
  name: string;
  license_number: string;
  owner_id: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  opening_hours?: Record<string, string>;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  distance_km?: number;
}

// Order types
export interface OrderItem {
  product_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  pharmacy_id: string;
  delivery_address_id?: string;
  delivery_type: 'pickup' | 'home_delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  pickup_code?: string;
  prescription_image_url?: string;
  prescription_validated: boolean;
  notes?: string;
  estimated_pickup_time?: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at: string;
  client?: User;
  pharmacy?: Pharmacy;
  delivery_address?: ClientAddress;
  items: OrderItemDetails[];
}

export interface OrderItemDetails {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface OrderCreate {
  pharmacy_id: string;
  delivery_address_id?: string;
  delivery_type: 'pickup' | 'home_delivery';
  items: OrderItem[];
  prescription_image_url?: string;
  notes?: string;
}

// Address types
export interface ClientAddress {
  id: string;
  user_id: string;
  label: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
}

export interface ClientAddressCreate {
  label?: string;
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;

  // Nouveaux champs pour adresse flexible
  address_type?: 'modern' | 'description' | 'gps';
  street_address?: string;
  neighborhood?: string;
  landmark_description?: string;
  delivery_phone?: string;
  delivery_instructions?: string;
}

// Search types
export interface ProductSearchParams {
  query?: string;
  category_id?: string;
  requires_prescription?: boolean;
  skip?: number;
  limit?: number;
}

export interface PharmacySearchParams {
  latitude: number;
  longitude: number;
  max_distance?: number;
  limit?: number;
}

// API functions
export const api = {
  // Authentication
  auth: {
    register: (userData: UserCreate): Promise<AxiosResponse<User>> =>
      apiClient.post('/auth/register', userData),
    
    login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      return apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
    },
    
    getProfile: (): Promise<AxiosResponse<User>> =>
      apiClient.get('/auth/me'),
    
    logout: (): Promise<AxiosResponse> =>
      apiClient.post('/auth/logout'),
  },

  // Products
  products: {
    search: (params: ProductSearchParams): Promise<AxiosResponse<Product[]>> =>
      apiClient.get('/products/search-enhanced', { params }),
    
    getById: (id: string): Promise<AxiosResponse<Product>> =>
      apiClient.get(`/products/${id}/`),
    
    getAvailability: (id: string, params?: { latitude?: number; longitude?: number; max_distance?: number }): Promise<AxiosResponse<ProductAvailability[]>> =>
      apiClient.get(`/products/${id}/availability/`, { params }),
    
    getSimilar: (id: string, limit?: number): Promise<AxiosResponse<Product[]>> =>
      apiClient.get(`/products/${id}/similar/`, { params: { limit } }),
  },

  // Pharmacies
  pharmacies: {
    list: (params?: { skip?: number; limit?: number; verified_only?: boolean }): Promise<AxiosResponse<Pharmacy[]>> =>
      apiClient.get('/pharmacies/', { params }),
    
    search: (params: PharmacySearchParams): Promise<AxiosResponse<Pharmacy[]>> =>
      apiClient.get('/pharmacies/search/', { params }),
    
    getById: (id: string): Promise<AxiosResponse<Pharmacy>> =>
      apiClient.get(`/pharmacies/${id}/`),
    
    getInventory: (id: string, params?: { skip?: number; limit?: number; in_stock_only?: boolean }) =>
      apiClient.get(`/pharmacies/${id}/inventory/`, { params }),
  },

  // Orders
  orders: {
    create: (orderData: OrderCreate): Promise<AxiosResponse<Order>> =>
      apiClient.post('/orders', orderData),
    
    getMyOrders: (params?: { skip?: number; limit?: number }): Promise<AxiosResponse<Order[]>> =>
      apiClient.get('/orders', { params }),
    
    getById: (id: string): Promise<AxiosResponse<Order>> =>
      apiClient.get(`/orders/${id}`),
    
    cancel: (id: string): Promise<AxiosResponse<Order>> =>
      apiClient.post(`/orders/${id}/cancel`),
    
    getTracking: (id: string): Promise<AxiosResponse<any>> =>
      apiClient.get(`/orders/${id}/tracking`),
    
    uploadPrescription: (file: File): Promise<AxiosResponse<{ image_url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/orders/upload-prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
  },

  // Addresses
  addresses: {
    create: (addressData: ClientAddressCreate): Promise<AxiosResponse<ClientAddress>> =>
      apiClient.post('/addresses', addressData),
    
    getMyAddresses: (): Promise<AxiosResponse<ClientAddress[]>> =>
      apiClient.get('/addresses'),
    
    update: (id: string, addressData: Partial<ClientAddressCreate>): Promise<AxiosResponse<ClientAddress>> =>
      apiClient.put(`/addresses/${id}`, addressData),
    
    delete: (id: string): Promise<AxiosResponse> =>
      apiClient.delete(`/addresses/${id}`),
  },

  // Categories
  categories: {
    list: (): Promise<AxiosResponse<Category[]>> =>
      apiClient.get('/categories/'),
  },

  // Cart
  cart: {
    getItems: (): Promise<AxiosResponse<any[]>> =>
      apiClient.get('/cart/items'),

    addItem: (itemData: { product_id: string; pharmacy_id: string; quantity: number }): Promise<AxiosResponse<any>> =>
      apiClient.post('/cart/items', itemData),

    updateItem: (itemId: string, itemData: { quantity: number }): Promise<AxiosResponse<any>> =>
      apiClient.put(`/cart/items/${itemId}`, itemData),

    removeItem: (itemId: string): Promise<AxiosResponse> =>
      apiClient.delete(`/cart/items/${itemId}`),

    clear: (): Promise<AxiosResponse> =>
      apiClient.delete('/cart/clear'),

    validateDelivery: (requestData: { delivery_type: string }): Promise<AxiosResponse<any>> =>
      apiClient.post('/cart/validate-delivery', requestData),

    createMultiOrder: (requestData: { delivery_type: string; payment_method: string; address_id?: string; notes?: string }): Promise<AxiosResponse<any>> =>
      apiClient.post('/cart/create-multi-order', requestData),
  },

  // Notifications
  notifications: {
    getAll: (params?: { skip?: number; limit?: number; unread_only?: boolean }): Promise<AxiosResponse<any[]>> =>
      apiClient.get('/notifications/', { params }),

    markAsRead: (notificationId: string): Promise<AxiosResponse> =>
      apiClient.patch(`/notifications/${notificationId}/read/`),

    markAllAsRead: (): Promise<AxiosResponse> =>
      apiClient.patch('/notifications/mark-all-read/'),

    delete: (notificationId: string): Promise<AxiosResponse> =>
      apiClient.delete(`/notifications/${notificationId}/`),

    clearAll: (): Promise<AxiosResponse> =>
      apiClient.delete('/notifications/'),
  },

  // Partner Analytics
  partner: {
    getDashboardStats: (): Promise<AxiosResponse<any>> =>
      apiClient.get('/partner/analytics/dashboard-stats'),

    getTopProducts: (limit?: number): Promise<AxiosResponse<any[]>> =>
      apiClient.get('/partner/analytics/top-products', { params: { limit } }),
  },

  // Prescriptions
  prescriptions: {
    upload: (formData: FormData): Promise<AxiosResponse<any>> =>
      apiClient.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),

    getMyRequests: (status?: string): Promise<AxiosResponse<any[]>> =>
      apiClient.get('/prescriptions/my-requests', { params: { status } }),

    getPharmacyRequests: (status?: string): Promise<AxiosResponse<any[]>> =>
      apiClient.get('/prescriptions/pharmacy-requests', { params: { status } }),

    validate: (validation: { prescription_request_id: string; action: string; pharmacist_notes?: string; rejection_reason?: string }): Promise<AxiosResponse<any>> =>
      apiClient.post('/prescriptions/validate', validation),

    getById: (id: string): Promise<AxiosResponse<any>> =>
      apiClient.get(`/prescriptions/${id}`),

    getAlternatives: (id: string, maxDistance?: number, limit?: number): Promise<AxiosResponse<any[]>> =>
      apiClient.get(`/prescriptions/${id}/alternatives`, { params: { max_distance: maxDistance, limit } }),

    retryWithAlternative: (id: string, formData: FormData): Promise<AxiosResponse<any>> =>
      apiClient.post(`/prescriptions/${id}/retry`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
  },

  // Payments
  payments: {
    createPaymentIntent: (data: { amount: number; currency?: string; order_ids?: string[]; metadata?: any }): Promise<AxiosResponse<any>> =>
      apiClient.post('/payments/create-payment-intent', data),

    confirmPayment: (data: { payment_intent_id: string; order_ids?: string[] }): Promise<AxiosResponse<any>> =>
      apiClient.post('/payments/confirm-payment', data),

    getConfig: (): Promise<AxiosResponse<{ publishable_key: string }>> =>
      apiClient.get('/payments/config'),
  }
};

export default api;