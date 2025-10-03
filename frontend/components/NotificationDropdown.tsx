import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useNotifications, Notification } from '../hooks/useNotifications';

const NotificationDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Note: Prescription expired notifications will auto-open their modal
    // through the existing auto-modal system in useNotifications
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <span className="sr-only">Voir les notifications</span>
          <BellIcon className="h-6 w-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[18px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <Menu.Item key={notification.id}>
                {({ active }) => (
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={clsx(
                      active ? 'bg-gray-50' : '',
                      !notification.is_read ? 'bg-blue-50' : '',
                      'w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      {!notification.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-sm font-medium',
                          notification.is_read ? 'text-gray-700' : 'text-gray-900'
                        )}>
                          {notification.title}
                        </p>
                        <p className={clsx(
                          'text-sm mt-1 line-clamp-2',
                          notification.is_read ? 'text-gray-500' : 'text-gray-600'
                        )}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationDropdown;