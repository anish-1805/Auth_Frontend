import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';
import { ChatMessage } from '../types/socket';

export const useChat = (token: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef(socketService.getSocket());

  useEffect(() => {
    if (!token) {
      setError('Authentication token not available');
      return;
    }

    // Connect to Socket.IO
    const socket = socketService.connect(token);
    socketRef.current = socket;

    // Connection success handler
    socket.on('connection:success', () => {
      setIsConnected(true);
      setError(null);
    });

    // Reconnection attempt handler
    socket.on('reconnect_attempt', (attemptNumber: number) => {
      setError(`Reconnecting... (attempt ${attemptNumber})`);
    });

    // Reconnection success handler
    socket.on('reconnect', () => {
      setIsConnected(true);
      setError(null);
    });

    // Reconnection failed handler
    socket.on('reconnect_failed', () => {
      setIsConnected(false);
      setError('Failed to reconnect. Please refresh the page.');
    });

    // Connection error handler
    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setError(`Connection failed: ${err.message}`);
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need to reconnect manually
        socket.connect();
      }
      // Otherwise, Socket.IO will automatically try to reconnect
    });

    // Message handler
    socket.on('chat:message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Typing indicator handler
    socket.on('chat:typing', (data) => {
      setIsTyping(data.isTyping);
    });

    // Error handler
    socket.on('chat:error', (data) => {
      setError(data.error);
      setIsTyping(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connection:success');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('reconnect_attempt');
      socket.off('reconnect');
      socket.off('reconnect_failed');
      socket.off('chat:message');
      socket.off('chat:typing');
      socket.off('chat:error');
    };
  }, [token]);

  const sendMessage = useCallback((message: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError('Not connected to chat server');
      return;
    }

    if (!message.trim()) {
      return;
    }

    socket.emit('chat:send', {
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isConnected,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
};
