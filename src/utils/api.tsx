// src/utils/api.ts
import axios from 'axios';

const api = axios.create({
  // in development, point at your local backend
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4000'
      : window.location.origin,
  headers: { 'Content-Type': 'application/json' }
});

export default api;
