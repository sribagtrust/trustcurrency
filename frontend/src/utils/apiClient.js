import axios from 'axios';

const API = 'https://api.trustcurrency.com';

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
