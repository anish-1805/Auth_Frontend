export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface ChatMessageRequest {
  message: string;
  timestamp: string;
}

export interface ServerToClientEvents {
  'chat:message': (data: ChatMessage) => void;
  'chat:typing': (data: { isTyping: boolean }) => void;
  'chat:error': (data: { error: string }) => void;
  'connection:success': (data: { message: string; userId: string }) => void;
  // Socket.IO built-in reconnection events
  'reconnect_attempt': (attemptNumber: number) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_failed': () => void;
}

export interface ClientToServerEvents {
  'chat:send': (data: ChatMessageRequest) => void;
  'chat:typing': () => void;
}
