import axios from 'axios';

const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: base
});

export default api;
