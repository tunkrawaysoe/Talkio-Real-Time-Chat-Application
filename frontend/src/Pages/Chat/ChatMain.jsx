import React from "react";
import { useSelector } from "react-redux";

const ChatMain = ({
  selectedConversation,
  getConversationName,
  chatMessages,
  onlineUserIds,
}) => {
  console.log(onlineUserIds);
  const otherUserId = selectedConversation?.participants?.[0]?.userId;
  const currentUserId = useSelector((state) => state.auth.user.id);
  const isOnline = onlineUserIds.includes(otherUserId);
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

          <form className="message-form">
            <input type="text" placeholder="Type a message..." />

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
