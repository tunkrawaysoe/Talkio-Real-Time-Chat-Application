import React from "react";

const ChatSide = ({
  conversations,
  getConversationName,
  selectedConversation,
  startConversation,
  onlineUserIds,
}) => {
  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <h2>Messages</h2>
      </div>

      <div className="conversation-list">
        {conversations.map((conversation) => {
          const conversationName = getConversationName(conversation);
          const otherUserId = conversation.participants?.[0]?.userId;
          const isOnline = onlineUserIds.includes(otherUserId);
          console.log(isOnline)
          return (
            <div
              key={conversation.id}
              className={`conversation-item ${
                selectedConversation?.id === conversation.id ? "active" : ""
              }`}
              onClick={() => startConversation(conversation.id)}
            >
              <div className="avatar-wrapper">
                <div className="avatar">
                  {conversationName.charAt(0).toUpperCase()}
                </div>

                {isOnline && <span className="online-dot"></span>}
              </div>

              <div className="conversation-info">
                <h3>{conversationName}</h3>

                <p>{conversation.lastMessage?.content || "No messages yet"}</p>
              </div>
            </div>
          );wrapper
        })}
      </div>
    </aside>
  );
};

export default ChatSide;
