import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../../../lib/socket.js";
import api from "../../../lib/axios.js";

const ChatMain = ({
  selectedConversationId,
  chatMessages,
  conversations,
  onlineUserIds,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const typingTimeoutRef = useRef(null);
  const messageListRef = useRef(null);

  const conversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  const otherUser = conversation?.participants?.[0];
  const isOnline = otherUser ? onlineUserIds.includes(otherUser.userId) : false;

  function scrollToBottom() {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }

  function handleTyping() {
    if (!conversation) return;
    socket.emit("typing", conversation.id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", conversation.id);
    }, 1000);
  }

  useEffect(() => {
    if (!selectedConversationId) return;

    function handleTyping(userId) {
      if (userId === otherUser?.userId) {
        setIsTyping(true);
      }
    }

    function handleStopTyping(userId) {
      if (userId === otherUser?.userId) {
        setIsTyping(false);
      }
    }

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedConversationId, otherUser?.userId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await api.post(`/message/${selectedConversationId}`, {
        content: message.trim(),
      });

      setMessage("");
      clearTimeout(typingTimeoutRef.current);

      if (conversation) {
        socket.emit("stop_typing", conversation.id);
      }

      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <main className="chat-content">
      {selectedConversationId ? (
        <>
          <header className="chat-header">
            <div className="avatar">
              {otherUser?.imageUrl ? (
                <img src={otherUser.imageUrl} alt={otherUser.name} />
              ) : (
                otherUser?.name?.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h3>{otherUser?.name || "Unknown"}</h3>
              <span>{isOnline ? "Online" : ""}</span>
            </div>
          </header>

          <div className="message-list" ref={messageListRef}>
            {chatMessages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`message ${isOwnMessage ? "sent" : "received"}`}
                  >
                    <p className="message-content">{message.content}</p>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="typing-indicator">
                <p>{otherUser?.name || "User"} is typing...</p>
              </div>
            )}
          </div>

          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
            />

            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <div className="empty-chat">
          <h2>Select a conversation</h2>
          <p>Choose a conversation to start chatting.</p>
        </div>
      )}
    </main>
  );
};

export default ChatMain;
