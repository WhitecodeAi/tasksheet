import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:3001';
 
export const api = axios.create({
  baseURL: BASE_URL,
  // Add headers or interceptors here if needed later
 
});
