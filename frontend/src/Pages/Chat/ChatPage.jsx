import { useEffect, useState } from "react";
import "./ChatPage.css";
import ChatSide from "./ChatSide";
import ChatMain from "./ChatMain";
import socket from "../../../lib/socket.js";
import { useSelector } from "react-redux";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const currentUserId = useSelector((state) => state.auth.user.id);
  const getConversationName = (conversation) => {
    return conversation.name || conversation.participants[0]?.name || "Unknown";
  };

  async function startConversation(conversationId) {
    try {
      const conversation = conversations.find(
        (conversation) => conversation.id === conversationId,
      );

      if (!conversation) {
        return;
      }

      setSelectedConversation(conversation);
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
      setChatMessages(data.messages);
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
    socket.emit("online", currentUserId);
    socket.on("online", (userIds) => {
      setOnlineUserIds(userIds);
    });
  }, []);

  return (
    <div className="chat-page">
      <ChatSide
        conversations={conversations}
        getConversationName={getConversationName}
        selectedConversation={selectedConversation}
        startConversation={startConversation}
        onlineUserIds={onlineUserIds}
      />

      <ChatMain
        selectedConversation={selectedConversation}
        getConversationName={getConversationName}
        chatMessages={chatMessages}
        onlineUserIds={onlineUserIds}
      />
    </div>
  );
};

export default Chat;
