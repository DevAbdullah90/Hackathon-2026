import { create } from 'zustand';
import { Notification } from '../../types/request.types';
import { NotificationStoreState } from '../../types/store.types';

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  lastAlert: null,
  isAlertVisible: false,

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      lastAlert: notification
    }));
  },

  markAllRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  markOneRead: (id) => {
    set(state => {
      const updated = state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const decrement = state.notifications.find(n => n.id === id && !n.isRead) ? 1 : 0;
      return { notifications: updated, unreadCount: Math.max(0, state.unreadCount - decrement) };
    });
  },

  setLastAlert: (alert) => set({ lastAlert: alert }),
  showAlert: () => set({ isAlertVisible: true }),
  hideAlert: () => set({ isAlertVisible: false }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0, lastAlert: null, isAlertVisible: false })
}));

// unreadCount drives badge counts; ensure it never goes negative.
// Emergency alerts are a special notification type displayed prominently.
