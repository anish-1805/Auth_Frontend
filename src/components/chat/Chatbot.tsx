import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import './Chatbot.css';

interface ChatbotProps {
  token: string | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ token }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isConnected, isTyping, error, sendMessage, clearError } =
    useChat(token);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-title">
                <h3>AI Assistant</h3>
                <span
                  className={`status ${isConnected ? 'online' : 'offline'}`}
                >
                  {isConnected ? '● Online' : '○ Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-avatar">👋</div>
                <h4>Welcome to AI Assistant!</h4>
                <p>
                  I'm here to help you with any questions about your account or
                  our services.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-bubble">{msg.message}</div>
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="message-bubble typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
                <button onClick={clearError}>✕</button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isConnected ? 'Type your message...' : 'Connecting...'
              }
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
