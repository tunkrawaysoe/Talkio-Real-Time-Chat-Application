import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/axios";
import "./Auth.css";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    userName: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>

        <p className="auth-subtitle">Sign up to start chatting</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-field">
            <label>Username</label>

            <input
              type="text"
              placeholder="Choose a username"
              value={form.userName}
              onChange={(e) =>
                setForm({
                  ...form,
                  userName: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          <button className="auth-button" type="submit">
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
