import axios from 'axios';

// Prefer explicit backend URL when provided (e.g. on Vercel), fallback to same-origin
const baseURL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export { api };
