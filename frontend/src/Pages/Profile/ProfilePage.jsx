import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import './ProfilePage.css'

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const accessToken = useSelector((state) => state.auth.accessToken);
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
  console.log(profile);

//   async function handleUpdate(e) {
//     e.preventDefault();

//     try {
//       const response = await fetch("http://localhost:4000/api/profile", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           name,
//           userName,
//           imageUrl,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to update profile");
//       }

//       setProfile(data);
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Update profile error:", error);
//     }
//   }

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p>Failed to load profile.</p>
      </div>
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
            <h2>{profile.name}</h2>

            <p className="profile-username">@{profile.userName}</p>

            <button
              className="edit-profile-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form className="profile-form" onSubmit={handleUpdate}>
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Username</label>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <label>Image URL</label>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            <div className="profile-actions">
              <button type="submit">Save</button>

              <button
                type="button"
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
