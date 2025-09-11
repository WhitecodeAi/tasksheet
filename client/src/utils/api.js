import axios from 'axios';

// Use current origin; requests use explicit "/api/..." paths across the app
const api = axios.create({
  baseURL: window.location.origin,
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
