import io from 'socket.io-client';

// Create socket connection
const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  autoConnect: false,
});

// Add authentication on connection
export const connectWithAuth = (token) => {
  if (token) {
    socket.auth = { token };
    socket.connect();
    return true;
  }
  return false;
};

// Disconnect socket
export const disconnect = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
