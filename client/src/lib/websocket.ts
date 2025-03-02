let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

export function createWebSocket() {
  // Get the WebSocket URL based on the environment variables
  const host = import.meta.env.VITE_WS_HOST || window.location.host;
  const path = import.meta.env.VITE_WS_PATH || '/api/ws';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${host}${path}`;

  console.log('WebSocket Environment Variables:', {
    VITE_WS_HOST: import.meta.env.VITE_WS_HOST,
    VITE_WS_PATH: import.meta.env.VITE_WS_PATH,
    VITE_DEV_SERVER_URL: import.meta.env.VITE_DEV_SERVER_URL,
    VITE_HMR_HOST: import.meta.env.VITE_HMR_HOST,
    VITE_HMR_PROTOCOL: import.meta.env.VITE_HMR_PROTOCOL,
    host,
    path,
    protocol,
    constructed_url: wsUrl
  });

  const socket = new WebSocket(wsUrl);

  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0;
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed', event.code, event.reason);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = RECONNECT_DELAY * reconnectAttempts;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`);

      setTimeout(() => {
        console.log('Initiating reconnection...');
        createWebSocket();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
    }
  });

  return socket;
}