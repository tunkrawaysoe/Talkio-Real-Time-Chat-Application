import { useEffect, useState } from "react";
import "./ChatPage.css";
import ChatSide from "./ChatSide";
import ChatMain from "./ChatMain";
import socket from "../../../lib/socket.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  const accessToken = useSelector((state) => state.auth.accessToken);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const navigate = useNavigate();

  async function fetchUserConversations() {
    try {
      const response = await fetch(
        "http://localhost:4000/api/conversation",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  async function startConversation(conversationId) {
    try {
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

      setSelectedConversationId(conversationId);
      setChatMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setChatMessages([]);
    }
  }

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds);
    };

    fetchUserConversations();

    if (currentUserId) {
      socket.emit("online", currentUserId);
    }

    socket.on("online", handleOnlineUsers);

    return () => {
      socket.off("online", handleOnlineUsers);
    };
  }, [accessToken, currentUserId, navigate]);

  return (
    <div className="chat-page">
      <ChatSide
        fetchUserConversations={fetchUserConversations}
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        startConversation={startConversation}
        onlineUserIds={onlineUserIds}
      />

      <ChatMain
        selectedConversationId={selectedConversationId}
        chatMessages={chatMessages}
        onlineUserIds={onlineUserIds}
        conversations={conversations}
      />
    </div>
  );
};

export default Chat;