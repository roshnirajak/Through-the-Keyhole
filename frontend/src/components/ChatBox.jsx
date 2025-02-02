import { useState, useEffect, useRef } from 'react';

const ChatBox = () => {
  const [isMinimized, setIsMinimized] = useState(false);  // State for minimizing the chatbox
  const [unreadMessages, setUnreadMessages] = useState(0); // To keep track of unread messages
  const chatBoxRef = useRef(null);

  // Function to handle minimize toggle
  const toggleMinimize = () => {
    setIsMinimized(prevState => !prevState);
    if (!isMinimized) {
      // Reset unread messages when chat is opened
      setUnreadMessages(0);
    }
  };

  // Simulate receiving a new message (for demonstration)
  useEffect(() => {
    // Simulating new message arrival
    const interval = setInterval(() => {
      if (!isMinimized) return; // If chat is open, don't increment unread messages
      setUnreadMessages(prev => prev + 1);
    }, 5000); // New message every 5 seconds

    return () => clearInterval(interval);  // Clean up interval on unmount
  }, [isMinimized]);

  return (
    <div className="chat-container">
      <div
        className={`chat-box ${isMinimized ? 'minimized' : ''}`}
        ref={chatBoxRef}
      >
        {!isMinimized && (
          <div className="chat-content">
            <h3>Chat</h3>
            <div className="messages">
              {/* Display chat messages here */}
              <p>Message 1</p>
              <p>Message 2</p>
              <p>Message 3</p>
            </div>
          </div>
        )}

        <div className="chat-footer">
          <button className="minimize-btn" onClick={toggleMinimize}>
            {isMinimized ? 'Expand' : 'Minimize'}
            {unreadMessages > 0 && (
              <span className="unread-dot">{unreadMessages}</span> // Red dot for unread messages
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
