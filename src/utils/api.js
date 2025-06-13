// client/src/utils/api.js
import axios from 'axios';

const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: 'https://6003cem-web-api-development-production.up.railway.app/',
  withCredentials: true, // optional
});

// Interceptor: always attach updated token (if user logs in)
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
