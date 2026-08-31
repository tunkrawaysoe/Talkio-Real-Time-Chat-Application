import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, authFailed } from "./store/authSlice.js";
import Chat from "./Pages/Chat/ChatPage";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Register";
import ProfilePage from "./Pages/Profile/ProfilePage";
import ProtectedRoute from "./Components/ProtectedRoute";

const App = () => {
  const isLoading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();

  useEffect(() => {
    async function refresh() {
      try {
        const response = await fetch("http://localhost:4000/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          dispatch(authFailed());
          return;
        }

        const data = await response.json();
        dispatch(login(data));
      } catch (error) {
        console.error(error);
        dispatch(authFailed());
      }
    }

    refresh();
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
