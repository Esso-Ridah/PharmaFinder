import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import api, { tokenManager, User, LoginCredentials, UserCreate } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialUser, setInitialUser] = useState<User | null>(null);

  // Don't fetch user profile on auth pages
  const isAuthPage = router.pathname.startsWith('/auth');

  // Get user profile query
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery(
    ['auth', 'profile'],
    () => api.auth.getProfile().then(res => res.data),
    {
      enabled: tokenManager.isAuthenticated() && isInitialized && !isAuthPage,
      retry: false,
      staleTime: 300000, // 5 minutes
      onError: () => {
        // If fetching profile fails, clear token only if not on auth page
        if (!isAuthPage) {
          tokenManager.removeToken();
        }
      },
      onSettled: () => {
        // Always stop loading after the query settles (success or error)
        console.log('Auth query settled');
      }
    }
  );

  // Login mutation
  const loginMutation = useMutation(
    (credentials: LoginCredentials) => api.auth.login(credentials),
    {
      onSuccess: async (response) => {
        const { access_token } = response.data;
        tokenManager.setToken(access_token);
        
        // Refetch user profile to get user role
        const userProfile = await api.auth.getProfile().then(res => res.data);
        queryClient.setQueryData(['auth', 'profile'], userProfile);
        
        toast.success('Connexion réussie !');
        
        // Redirect based on role or intended page
        const redirectTo = router.query.redirect as string;
        if (redirectTo) {
          router.replace(redirectTo);
        } else {
          // Default redirects based on role
          switch (userProfile.role) {
            case 'pharmacist':
              router.replace('/partner/dashboard');
              break;
            case 'admin':
              router.replace('/admin/dashboard');
              break;
            default:
              // Redirect clients to dashboard
              router.replace('/dashboard');
          }
        }
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur de connexion';
        toast.error(message);
      },
    }
  );

  // Register mutation
  const registerMutation = useMutation(
    (userData: UserCreate) => api.auth.register(userData),
    {
      onSuccess: (response) => {
        toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        router.push('/auth/login');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors de l\'inscription';
        toast.error(message);
      },
    }
  );

  // Logout function
  const logout = () => {
    tokenManager.removeToken();
    queryClient.clear();
    // Clear any cached user data
    localStorage.removeItem('user_data');
    toast.success('Déconnexion réussie');
    // Force window reload to ensure clean state
    window.location.href = '/';
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Load user from localStorage if available
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          setInitialUser(JSON.parse(userData));
        } catch (error) {
          console.error('Failed to parse user data from localStorage:', error);
        }
      }
    }
    setIsInitialized(true);
  }, []);

  // Store user data in localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_data');
    }
  }, [user]);

  const currentUser = user || initialUser;
  
  // Force loading to false for non-authenticated users or after timeout
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    // Force ready state after 2 seconds if not authenticated
    const timeout = setTimeout(() => {
      if (!tokenManager.isAuthenticated()) {
        setForceReady(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const shouldShowLoading = !isInitialized ||
    (isUserLoading && tokenManager.isAuthenticated() && !isAuthPage && !forceReady);

  const value: AuthContextType = {
    user: currentUser,
    isLoading: shouldShowLoading,
    isAuthenticated: !!currentUser && tokenManager.isAuthenticated(),
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    refetchUser: () => refetchUser(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component to protect routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) => {
  const AuthenticatedComponent = (props: P) => {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Redirect to login with current path as redirect
          router.replace(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
          return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
          // User doesn't have required role
          toast.error('Vous n\'avez pas les permissions nécessaires');
          router.replace('/dashboard');
          return;
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    // Don't render component if not authenticated or authorized
    if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
      return null;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

// Hook to check if user has specific role
export const useRole = (requiredRole: string | string[]) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

// Hook to get user permissions
export const usePermissions = () => {
  const { user } = useAuth();
  
  const permissions = {
    canViewPharmacyDashboard: user?.role === 'pharmacist' || user?.role === 'admin',
    canManagePharmacy: user?.role === 'pharmacist' || user?.role === 'admin',
    canManageOrders: user?.role === 'pharmacist' || user?.role === 'admin',
    canViewAdminPanel: user?.role === 'admin',
    canCreatePharmacy: user?.role === 'pharmacist' || user?.role === 'admin',
    canPlaceOrder: user?.role === 'client' || user?.role === 'admin',
  };
  
  return permissions;
};