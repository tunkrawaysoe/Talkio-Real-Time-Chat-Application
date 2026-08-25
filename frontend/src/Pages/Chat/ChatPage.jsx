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
      if (selectedConversationId) {
        socket.emit("leave_conversation", selectedConversationId);
      }

      socket.emit("join_conversation", conversationId);
      setSelectedConversationId(conversationId);
      setChatMessages(await response.json());
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
