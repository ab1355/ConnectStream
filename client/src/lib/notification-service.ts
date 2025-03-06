import { apiRequest } from './queryClient';

interface CreateNotificationData {
  userId: number;
  title: string;
  content: string;
  type: string;
  link?: string;
}

export const notificationService = {
  async create(data: CreateNotificationData) {
    const res = await apiRequest('POST', '/api/notifications', data);
    return res.json();
  },

  async markAsRead(notificationIds: number[]) {
    const res = await apiRequest('POST', '/api/notifications/mark-read', {
      notificationIds
    });
    return res.json();
  },

  async getUnread() {
    const res = await apiRequest('GET', '/api/notifications/unread');
    return res.json();
  }
};
