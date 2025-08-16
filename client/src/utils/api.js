import axios from 'axios';

//const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiUrl = 'https://tasksheet-backend-vite-production.up.railway.app';

console.log('🔗 API URL:', apiUrl);

export const api = axios.create({
  baseURL: apiUrl,
  // Add headers or interceptors here if needed later

});
