import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { BACKEND_API_URL } from '../utils/helpers';

const socket = io(BACKEND_API_URL);

const generateColorFromSocketId = (socketId) => {
  if (!socketId) return '#D3D3D3';

  let hash = 0;
  for (let i = 0; i < socketId.length; i++) {
    hash = (hash << 5) - hash + socketId.charCodeAt(i);
    hash |= 0;
  }

  const color = (hash & 0x00FFFFFF).toString(16).padStart(6, '0');
  return `#${color}`;
};

const Chatbox = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isChatboxOpen, setIsChatboxOpen] = useState(true);
  const [newMessageIndicator, setNewMessageIndicator] = useState(false);
  const messageInputRef = useRef(null);
  const redDotTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbox = () => {
    setIsChatboxOpen(!isChatboxOpen);
    if (isChatboxOpen) {
      setTimeout(() => setNewMessageIndicator(false), 2000);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        text: message,
        senderId: currentUserId,
        timestamp: new Date().toISOString(),
        seenBy: [],
      };

      socket.emit('send-message', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
      scrollToBottom();
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      setCurrentUserId(socket.id);
    });

    setCurrentUserId(socket.id);
    socket.on('receive-message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom(); // Scroll when a new message arrives

      if (!isChatboxOpen) {
        setNewMessageIndicator(true);
      } else {
        setNewMessageIndicator(true);
        clearTimeout(redDotTimeoutRef.current);
        redDotTimeoutRef.current = setTimeout(() => {
          setNewMessageIndicator(false);
        }, 2000);
      }
    });

    socket.on('message-seen', (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.timestamp === messageId ? { ...msg, seenBy: [...msg.seenBy, socket.id] } : msg
        )
      );
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-seen');
    };
  }, [isChatboxOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`chatbox ${isChatboxOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleChatbox} className="toggle-chatbox-btn">
        {isChatboxOpen ? 'Minimize' : 'Maximize'}
        {newMessageIndicator && !isChatboxOpen && (
          <span className="new-message-indicator red-dot"></span>
        )}
      </button>
      <div className="messages-container" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {messages.map((msg) => {
            const messageColor = generateColorFromSocketId(msg.senderId);
            const isSelf = msg.senderId === currentUserId;

            return (
              <div
                key={msg.timestamp}
                className="chatLine"
                style={{
                  maxWidth: '100%',
                  display: 'flex',
                  justifyContent: isSelf ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  className={`message ${isSelf ? 'self' : 'other'}`}
                  style={{
                    maxWidth: '70%',
                    backgroundColor: isSelf ? '#D3D3D3' : messageColor,
                    borderRadius: isSelf ? '20px 20px 0px 20px' : '20px 20px 20px 0px',
                    padding: '10px 15px',
                    color: isSelf ? '#000' : '#FFF',
                    wordWrap: 'break-word',
                    textAlign: 'left', // Ensures text stays left-aligned inside the bubble
                  }}
                >
                  <p style={{ fontSize: '8px', marginBottom: '5px' }}>{msg.senderId}:</p>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* for scroll */}
        <div ref={messagesEndRef} />
      </div>
      {isChatboxOpen && (
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            ref={messageInputRef}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
