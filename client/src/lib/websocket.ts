let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

export function createWebSocket() {
  // Use the current host from the browser
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/api/ws`;

  console.log('Attempting WebSocket connection to:', wsUrl); // Debug log

  const socket = new WebSocket(wsUrl);

  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
    reconnectAttempts = 0;
  });

  socket.addEventListener('error', (error) => {
    console.error('WebSocket connection error:', error);
    // Don't attempt to reconnect on error, let the close handler handle it
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