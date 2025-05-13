import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        username,
        password,
      });
      localStorage.setItem("token", res.data.accessToken);
      onLogin(); // Notify parent component
      navigate("/"); // Redirect to the home page after login
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  const handleSignup = () => {
    navigate("/signup"); // Navigate to the signup page
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p>
        New user?{" "}
        <button type="button" onClick={handleSignup} className="signup-button">
          Sign up here
        </button>
      </p>
    </div>
  );
};

export default LoginPage;