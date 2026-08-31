import { useEffect, useState } from "react";
import "./ChatPage.css";
import ChatSide from "./ChatSide";
import ChatMain from "./ChatMain";
import socket from "../../../lib/socket.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/axios.js";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const navigate = useNavigate();

  async function fetchUserConversations() {
    try {
      const response = await api.get("/conversation");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  async function startConversation(conversationId) {
    try {
      const response = await api.get(`/conversation/${conversationId}`);

      if (selectedConversationId) {
        socket.emit("leave_conversation", selectedConversationId);
      }

      socket.emit("join_conversation", conversationId);
      setSelectedConversationId(conversationId);
      setChatMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setChatMessages([]);
    }
  }

  useEffect(() => {
    const handleOnlineUsers = (userIds) => {
      setOnlineUserIds(userIds);
    };

    const handleNewMessageNotification = (message) => {
      setConversations((prev) =>
        prev.map((prevConversation) =>
          prevConversation.id === message.conversationId
            ? {
                ...prevConversation,
                lastMessage: {
                  ...prevConversation.lastMessage,
                  content: message.content,
                },
              }
            : prevConversation,
        ),
      );
    };

    const handleNewChatMessage = (message) => {
      setChatMessages((prev) => [
        ...prev,
        {
          content: message.content,
          senderId: message.senderId,
        },
      ]);
    };

    fetchUserConversations();

    if (currentUserId) {
      socket.emit("online", currentUserId);
    }

    socket.on("online", handleOnlineUsers);
    socket.on("new_message_notification", handleNewMessageNotification);
    socket.on("new_message", handleNewChatMessage);

    return () => {
      socket.off("online", handleOnlineUsers);
      socket.off("new_message_notification", handleNewMessageNotification);
      socket.off("new_message", handleNewChatMessage);
    };
  }, [currentUserId, navigate]);

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
