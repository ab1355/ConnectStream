import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  userId: number;
  createdAt: string;
  isRead: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    console.log('Attempting WebSocket connection to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'notification') {
          const notification = message.data as Notification;
          toast({
            title: notification.title,
            description: notification.content,
            variant: notification.type === 'error' ? 'destructive' : 'default',
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish real-time connection. Some features may be unavailable.",
        variant: "destructive",
      });
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      // Attempt to reconnect after 5 seconds if the connection was not closed intentionally
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          setSocket(null); // This will trigger a new connection attempt
        }, 5000);
      }
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, [user, toast]);

  return socket;
}