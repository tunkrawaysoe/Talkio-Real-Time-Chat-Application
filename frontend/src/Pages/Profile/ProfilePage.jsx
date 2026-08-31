import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice.js";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function getProfile() {
      try {
        const response = await fetch(
          "http://localhost:4000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to get profile");
        }
        setProfile(data);
        setName(data.name);
        setUserName(data.userName);
        setImageUrl(data.imageUrl || "");
      } catch (error) {
        console.error("Get profile error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) {
      getProfile();
    }
  }, [accessToken]);

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          userName,
          imageUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      setProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Update profile error:", error);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Logout request failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  }
  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <p className="profile-loading">Loading...</p>
        </div>
      </main>
    );
  }
  if (!profile) {
    return (
      <main className="profile-page">
        <div className="profile-card">
          <p className="profile-error">Failed to load profile.</p>
          <button className="profile-back" onClick={() => navigate("/")}>
            ← Back
          </button>
        </div>
      </main>
    );
  }
  return (
    <main className="profile-page">
      <div className="profile-card">
        <button className="profile-back" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="profile-avatar">
          {profile.imageUrl ? (
            <img src={profile.imageUrl} alt={profile.name} />
          ) : (
            profile.name?.charAt(0).toUpperCase()
          )}
        </div>
        {!isEditing ? (
          <>
            <div className="profile-info">
              <h2>{profile.name}</h2>
              <p className="profile-username">@{profile.userName}</p>
            </div>
            <div className="profile-buttons">
              <button
                className="edit-profile-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <form className="profile-form" onSubmit={handleUpdate}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <label htmlFor="imageUrl">Image URL</label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <div className="profile-actions">
              <button type="submit" className="save-button">
                Save
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setName(profile.name);
                  setUserName(profile.userName);
                  setImageUrl(profile.imageUrl || "");
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
export default ProfilePage;
