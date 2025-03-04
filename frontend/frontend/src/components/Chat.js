import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userApi, chatApi } from "../utils/api";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const ws = useRef(null);

  // Function to verify token
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found in localStorage");
        return false;
      }
      const response = await userApi.get("/users/verify/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("RESPONSE IS: ", response);
      console.log("Token Verified:", response.data);
      return true;
    } catch (err) {
      console.error("Token Verification Failed:", err.response.data);
      return false;
    }
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await chatApi.get("/chat/history/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Failed to load chat history.");
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    const token = localStorage.getItem("access_token");
    ws.current = new WebSocket(
      `ws://127.0.0.1:8001/ws/chat/room1?token=${token}`
    );

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("New message received:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected. Reconnecting...");
      setTimeout(() => connectWebSocket(), 5000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.current.close();
    };
  };

  // Function to send a new message
  const sendMessage = () => {
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      newMessage.trim()
    ) {
      ws.current.send(JSON.stringify({ message: newMessage }));
      setNewMessage("");
    }
  };

  // Handle enter key press for sending message
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  // Use useEffect to verify token, load chat history, and connect to WebSocket
  useEffect(() => {
    const initializeChat = async () => {
      const isVerified = await verifyToken();
      if (isVerified) {
        await loadChatHistory();
        connectWebSocket();
      } else {
        navigate("/login");
      }
    };

    initializeChat();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>Chat Room 1</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
