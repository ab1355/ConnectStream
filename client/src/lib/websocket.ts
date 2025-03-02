let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

export function createWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/ws`;

  const socket = new WebSocket(wsUrl);

  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0;
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed');

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = RECONNECT_DELAY * reconnectAttempts;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`);

      setTimeout(() => {
        createWebSocket();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
    }
  });

  return socket;
}