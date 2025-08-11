import axios from 'axios';

//const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiUrl =
  import.meta?.env?.VITE_API_URL || // Vite
  process.env?.REACT_APP_API_URL || // CRA
  'http://localhost:3001';          // Fallback for local dev

  
export const api = axios.create({
  baseURL: apiUrl,
  // Add headers or interceptors here if needed later
 
});
