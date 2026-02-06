import axios from 'axios';

const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com';

const api = axios.create({
  baseURL: base
});

export default api;
