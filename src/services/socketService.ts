import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '../types/socket';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private readonly serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  connect(token: string): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      auth: {
        token,
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      // Reconnection configuration
      reconnection: true, // Enable automatic reconnection
      reconnectionAttempts: 5, // Try 5 times before giving up
      reconnectionDelay: 1000, // Wait 1 second before first retry
      reconnectionDelayMax: 5000, // Maximum delay between retries
      timeout: 20000, // Connection timeout (20 seconds)
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
