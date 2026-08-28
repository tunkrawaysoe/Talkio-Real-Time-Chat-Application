import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import socket from "../../../lib/socket.js";

const ChatMain = ({
  selectedConversationId,
  chatMessages,
  conversations,
  onlineUserIds,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const typingTimeoutRef = useRef(null);
  console.log(chatMessages);

  const conversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  const otherUser = conversation?.participants?.[0];
  const isOnline = otherUser ? onlineUserIds.includes(otherUser.userId) : false;

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
  }, [selectedConversationId]);

  async function sendMessage(e) {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/message/${selectedConversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      await response.json();

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
              <h3>{otherUser?.name}</h3>
              <span>{isOnline ? "Online" : ""}</span>
            </div>
          </header>

          <div className="message-list">
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
                    {isOwnMessage ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className="message-user">
                        <div className="message-avatar">
                          {message.imageUrl ? (
                            <img src={message.imageUrl} alt={message.name} />
                          ) : (
                            message.name?.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <span className="message-name">{message.name}</span>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="typing-indicator">
                <p>{otherUser?.name} is typing...</p>
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
