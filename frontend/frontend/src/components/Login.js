import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await userApi.post("/users/login/", {
        username,
        password,
      });
      console.log("Login Success:", response.data);

      try {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        console.log("Access Token Set:", localStorage.getItem("access_token"));
        console.log(
          "Refresh Token Set:",
          localStorage.getItem("refresh_token")
        );
      } catch (error) {
        console.error("Error setting tokens in localStorage:", error);
      }

      userApi.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;

      navigate("/chat"); // Redirect to chat page
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;
