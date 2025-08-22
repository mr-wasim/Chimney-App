import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://chimney-app.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE + '/api',
  withCredentials: true
});

export default api;
