import { useEffect, useState } from "react";

const ChatSide = ({
  conversations,
  getConversationName,
  selectedConversation,
  startConversation,
  onlineUserIds,
}) => {
  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState({});
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
        <h2>Messages</h2>

        <div className="user-search">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search.trim() && searchUser?.id && (
          <div className="search-result-container">
            <div className="search-result">
              <div className="avatar">
                {searchUser.name.charAt(0).toUpperCase()}
              </div>

              <div className="search-result-info">
                <h3>{searchUser.name}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="conversation-list">
        {conversations.map((conversation) => {
          const conversationName = getConversationName(conversation);
          const otherUserId = conversation.participants?.[0]?.userId;

          const isOnline = onlineUserIds.includes(otherUserId);

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
          );
        })}
      </div>
    </aside>
  );
};

export default ChatSide;
