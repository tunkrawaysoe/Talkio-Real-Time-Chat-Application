import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FiMenu, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ChatSide = ({
  fetchUserConversations,
  conversations,
  selectedConversationId,
  startConversation,
  onlineUserIds,
}) => {
  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState({});
  const [isShowMenu, setIsShowMenu] = useState(false);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const navigate = useNavigate();

  async function createConversation() {
    try {
      const response = await fetch("http://localhost:4000/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: searchUser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create conversation");
      }
      fetchUserConversations();
      startConversation(data.conversation.id);
      setSearch("");
      setSearchUser({});
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  }

  useEffect(() => {
    if (!search.trim()) {
      setSearchUser({});
      return;
    }

    async function findUser() {
      try {
        const response = await fetch(
          `http://localhost:4000/api/users/search?name=${encodeURIComponent(
            search,
          )}`,
        );

        if (!response.ok) {
          setSearchUser({});
          return;
        }

        const data = await response.json();
        setSearchUser(data);
      } catch (error) {
        console.error("Search user error:", error);
        setSearchUser({});
      }
    }

    findUser();
  }, [search]);

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <div className="search-container">
          <div className="menu-container">
            <button
              className="menu-button"
              onClick={() => setIsShowMenu((prev) => !prev)}
            >
              <FiMenu size={22} />
            </button>

            {isShowMenu && (
              <div className="menu-dropdown">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsShowMenu(false);
                  }}
                >
                  <FiUser size={18} />
                  <span>Profile</span>
                </button>
              </div>
            )}
          </div>
          <div className="user-search">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {search.trim() && searchUser?.id && (
          <div className="search-result-container">
            <div className="search-result" onClick={createConversation}>
              <div className="avatar">
                {searchUser?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="search-result-info">
                <h3>{searchUser?.name}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="conversation-list">
        {conversations.map((conversation) => {
          const otherUser = conversation?.participants?.[0];
          const otherUserId = otherUser?.userId;
          const conversationName = otherUser?.name || "Unknown";
          const isOnline = onlineUserIds.includes(otherUserId);

          return (
            <div
              key={conversation.id}
              className={`conversation-item ${
                selectedConversationId === conversation.id ? "active" : ""
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
          );
        })}
      </div>
    </aside>
  );
};

export default ChatSide;
