import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from './useAuth';
import PrescriptionExpiredModal from '../components/PrescriptionExpiredModal';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'pharmacy' | 'product' | 'prescription_expired';
  is_read: boolean;
  created_at: string;
  data?: {
    order_id?: string;
    pharmacy_id?: string;
    product_id?: string;
    [key: string]: any;
  };
  meta_data?: {
    prescription_request_id?: string;
    pharmacy_name?: string;
    product_name?: string;
    action?: string;
    [key: string]: any;
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetch: () => void;
  // Auto-modal functionality for prescription expired notifications
  expiredModalData: {
    isOpen: boolean;
    prescriptionRequest: any;
  } | null;
  closeExpiredModal: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [expiredModalData, setExpiredModalData] = useState<{ isOpen: boolean; prescriptionRequest: any } | null>(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(new Set());
  const [preventAutoOpen, setPreventAutoOpen] = useState(false);

  // Fetch notifications for authenticated users
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery(
    ['notifications'],
    () => api.notifications.getAll().then(res => res.data),
    {
      enabled: isAuthenticated,
      retry: 1,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute for real-time updates
      onError: (error) => {
        console.error('Failed to fetch notifications:', error);
      }
    }
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation(
    (notificationId: string) => api.notifications.markAsRead(notificationId),
    {
      onSuccess: (_, notificationId) => {
        // Optimistically update the cache
        queryClient.setQueryData<Notification[]>(['notifications'], (oldData) => {
          if (!oldData) return [];
          return oldData.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          );
        });
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors du marquage comme lu';
        toast.error(message);
        // Refetch to get correct state
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation(
    () => api.notifications.markAllAsRead(),
    {
      onSuccess: () => {
        // Optimistically update the cache
        queryClient.setQueryData<Notification[]>(['notifications'], (oldData) => {
          if (!oldData) return [];
          return oldData.map(notification => ({ ...notification, is_read: true }));
        });
        toast.success('Toutes les notifications marquées comme lues');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors du marquage';
        toast.error(message);
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  // Delete notification mutation
  const deleteNotificationMutation = useMutation(
    (notificationId: string) => api.notifications.delete(notificationId),
    {
      onSuccess: (_, notificationId) => {
        // Optimistically update the cache
        queryClient.setQueryData<Notification[]>(['notifications'], (oldData) => {
          if (!oldData) return [];
          return oldData.filter(notification => notification.id !== notificationId);
        });
        toast.success('Notification supprimée');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors de la suppression';
        toast.error(message);
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  // Clear all notifications mutation
  const clearAllMutation = useMutation(
    () => api.notifications.clearAll(),
    {
      onSuccess: () => {
        queryClient.setQueryData(['notifications'], []);
        toast.success('Toutes les notifications supprimées');
      },
      onError: (error: any) => {
        const message = error.response?.data?.detail || 'Erreur lors de la suppression';
        toast.error(message);
        queryClient.invalidateQueries(['notifications']);
      }
    }
  );

  // Auto-open modal for prescription expired notifications
  useEffect(() => {
    if (notifications.length > 0) {
      console.log('🔍 Checking notifications for prescription expired:', notifications);

      const expiredNotifications = notifications.filter(
        n => {
          const isExpired = n.type === 'prescription_expired';
          const isUnread = !n.is_read;
          const isDismissed = dismissedNotificationIds.has(n.id);
          // Check for prescription request ID in meta_data (primary) or data (fallback)
          const hasId = n.meta_data?.prescription_request_id ||
                       n.data?.prescription_request_id ||
                       (n.data as any)?.meta_data?.prescription_request_id;

          console.log(`📋 Notification ${n.id}: type=${n.type}, unread=${isUnread}, dismissed=${isDismissed}, hasId=${hasId}`, n.data, n.meta_data);

          return isUnread && isExpired && hasId && !isDismissed;
        }
      );

      console.log('⚡ Found expired notifications:', expiredNotifications.length, expiredNotifications);

      if (expiredNotifications.length > 0 && !expiredModalData?.isOpen && !preventAutoOpen) {
        const latestExpired = expiredNotifications[0];
        // Get prescription request data from meta_data (primary) or data (fallback)
        const prescriptionRequestId = latestExpired.meta_data?.prescription_request_id ||
                                     latestExpired.data?.prescription_request_id ||
                                     (latestExpired.data as any)?.meta_data?.prescription_request_id;

        const productName = latestExpired.meta_data?.product_name ||
                           latestExpired.data?.product_name ||
                           (latestExpired.data as any)?.meta_data?.product_name || 'Produit';

        const pharmacyName = latestExpired.meta_data?.pharmacy_name ||
                            latestExpired.data?.pharmacy_name ||
                            (latestExpired.data as any)?.meta_data?.pharmacy_name || 'Pharmacie';

        console.log('🚀 Opening modal for prescription:', prescriptionRequestId, latestExpired);

        // Construct prescription request object from notification data
        const prescriptionRequest = {
          id: prescriptionRequestId,
          notificationId: latestExpired.id, // Add notification ID for tracking dismissal
          product: {
            name: productName
          },
          pharmacy: {
            name: pharmacyName
          }
        };

        console.log('📄 Prescription request data:', prescriptionRequest);

        setExpiredModalData({
          isOpen: true,
          prescriptionRequest
        });

        // Automatically mark the notification as read since we're showing the modal
        markAsReadMutation.mutate(latestExpired.id);
      }
    }
  }, [notifications, expiredModalData?.isOpen, markAsReadMutation, dismissedNotificationIds]);

  const closeExpiredModal = () => {
    console.log('🔴 Closing expired modal');

    // Get notification ID before clearing modal data
    const notificationId = expiredModalData?.prescriptionRequest?.notificationId;

    // First prevent auto-opening and add to dismissed list
    setPreventAutoOpen(true);
    if (notificationId) {
      setDismissedNotificationIds(prev => new Set([...prev, notificationId]));
    }

    // Then close the modal
    setExpiredModalData(null);

    // Reset prevent auto-open after a short delay to allow future modals
    setTimeout(() => {
      setPreventAutoOpen(false);
    }, 1000);
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading: isAuthenticated ? isLoading : false,
    markAsRead: (notificationId: string) => markAsReadMutation.mutateAsync(notificationId),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    deleteNotification: (notificationId: string) => deleteNotificationMutation.mutateAsync(notificationId),
    clearAll: () => clearAllMutation.mutateAsync(),
    refetch: () => refetch(),
    expiredModalData,
    closeExpiredModal,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {expiredModalData?.isOpen && (
        <PrescriptionExpiredModal
          isOpen={expiredModalData.isOpen}
          prescriptionRequest={expiredModalData.prescriptionRequest}
          onClose={closeExpiredModal}
          onRetrySuccess={() => {
            closeExpiredModal();
            refetch(); // Refresh notifications
          }}
          onContinueShopping={closeExpiredModal}
        />
      )}
    </NotificationsContext.Provider>
  );
};