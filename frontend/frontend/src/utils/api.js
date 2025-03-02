import axios from "axios";

// User Service on port 8000
export const userApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Chat Service on port 8001
export const chatApi = axios.create({
  baseURL: "http://127.0.0.1:8001/api/",
});

// Attach Authorization Header to both instances
const attachToken = (config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Authorization Header Set:", config.headers.Authorization);
  } else {
    console.warn("No access token found in localStorage");
    delete config.headers.Authorization;
  }
  return config;
};

userApi.interceptors.request.use(attachToken);
chatApi.interceptors.request.use(attachToken);
