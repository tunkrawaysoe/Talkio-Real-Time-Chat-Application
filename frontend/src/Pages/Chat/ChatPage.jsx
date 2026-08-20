import { useEffect, useState } from "react";
import "./ChatPage.css";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const currentUserId = 2;

  const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc4NzIxOTg5NSwiZXhwIjoxNzg3MjIzNDk1fQ.yl2zJCI_smisV6eHlWvWev1CdVq-i7QA_JpgARNV2Mk";

  async function startConversation(conversationId) {
    try {
      setSelectedConversation(conversationId);

      const response = await fetch(
        `http://localhost:4000/api/conversation/${conversationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      setChatMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setChatMessages([]);
    }
  }

  useEffect(() => {
    async function fetchUserConversations() {
      try {
        const response = await fetch("http://localhost:4000/api/conversation", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();

        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    }

    fetchUserConversations();
  }, []);

  const selected = conversations.find(
    (conversation) => conversation.id === selectedConversation,
  );

  const selectedOtherUser = selected?.participants.find(
    (participant) => participant.userId !== currentUserId,
  );

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>

        <div className="conversation-list">
          {conversations.map((conversation) => {
            const otherUser = conversation.participants.find(
              (participant) => participant.userId !== currentUserId,
            );

            const lastMessage =
              conversation.messages[conversation.messages.length - 1];

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  selectedConversation === conversation.id ? "active" : ""
                }`}
                onClick={() => startConversation(conversation.id)}
              >
                <div className="avatar">
                  {otherUser?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="conversation-info">
                  <h3>{otherUser?.name}</h3>

                  <p>{lastMessage ? lastMessage.content : "No messages yet"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="chat-content">
        {selectedConversation ? (
          <>
            <header className="chat-header">
              <div className="avatar">
                {selectedOtherUser?.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3>{selectedOtherUser?.name}</h3>
                <span>Online</span>
              </div>
            </header>

            <div className="message-list">
              {chatMessages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet</p>
                </div>
              ) : (
                chatMessages.map((message, index) => {
                  const isMine = message.userId === currentUserId;

                  return (
                    <div
                      key={index}
                      className={`message ${isMine ? "sent" : "received"}`}
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
    </div>
  );
};

export default Chat;
