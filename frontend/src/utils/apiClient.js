import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://api.thetrustcurrency.com'; // This should match the backend URL in production, and can be overridden by .env for local development

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Add a request interceptor to attach token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
