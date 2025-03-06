import { useEffect } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useToast } from '@/hooks/use-toast';

export function NotificationToast() {
  const socket = useNotifications();
  const { toast } = useToast();

  // This component only handles the connection
  // The actual notifications are handled in the useNotifications hook
  return null;
}
