import axios from 'axios';

const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'https://3g3cvz53y9.execute-api.us-east-1.amazonaws.com';

const api = axios.create({ baseURL: base });

// Attach Authorization header from localStorage for admin requests
api.interceptors.request.use((config) => {
  try {
    let token = null;
    try { token = localStorage.getItem('token'); } catch (e) {}
    if (!token) {
      try { token = sessionStorage.getItem('token'); } catch (e) {}
    }
    if (token) config.headers = config.headers || {}, config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore (server-side rendering or no localStorage)
  }
  return config;
});

export default api;
