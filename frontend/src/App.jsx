import React, { useEffect } from "react";
import Chat from "./Pages/Chat/ChatPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Register";
import ProfilePage from "./Pages/Profile/ProfilePage";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./store/authSlice.js";

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

        if (!response.ok) return;

        const data = await response.json();
        dispatch(login(data));
      } catch (error) {
        console.error(error);
      }
    }

    refresh();
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Chat />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
