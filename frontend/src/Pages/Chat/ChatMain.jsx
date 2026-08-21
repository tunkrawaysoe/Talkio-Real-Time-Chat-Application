import { useState } from "react";
import { useSelector } from "react-redux";
import socket from "../../../lib/socket.js";

const ChatMain = ({
  selectedConversation,
  getConversationName,
  chatMessages,
  onlineUserIds,
}) => {
  const otherUserId = selectedConversation?.participants?.[0]?.userId;
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const isOnline = onlineUserIds.includes(otherUserId);
  const conversationId = selectedConversation?.id;
  const [message, setMessage] = useState("");

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const response = await fetch(
        `http://localhost:4000/api/message/${conversationId}`,
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
      socket

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  return (
    <main className="chat-content">
      {selectedConversation ? (
        <>
          <header className="chat-header">
            <div className="avatar">
              {getConversationName(selectedConversation)
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h3>{getConversationName(selectedConversation)}</h3>

              <span>{isOnline ? "Online" : ""}</span>
            </div>
          </header>

          <div className="message-list">
            {chatMessages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={index}
                    className={`message ${isOwnMessage ? "sent" : "received"}`}
                  >
                    <p>{message.content}</p>
                  </div>
                );
              })
            )}
          </div>

          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
