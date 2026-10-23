import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    let errors = [];

    if (error.response && error.response.data) {
      message = error.response.data.message || message;
      errors = error.response.data.errors || [];
    } else if (error.message) {
      message = error.message;
    }

    const customError = new Error(message);
    customError.status = error.response ? error.response.status : 500;
    customError.errors = errors;
    return Promise.reject(customError);
  }
);

export default api;
