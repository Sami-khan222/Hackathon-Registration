import axios from 'axios';

/**
 * Shared axios instance. `withCredentials` lets the browser send the HTTP-only auth cookie;
 * the JWT itself is never readable from JavaScript.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 20000,
});

/** Normalises any axios failure into { message, fieldErrors, code, status, data } for the UI. */
export const parseApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    return { status, message: data?.message || 'Something went wrong.', fieldErrors: data?.errors || {}, code: data?.code, data: data || {} };
  }
  if (error.code === 'ECONNABORTED') return { status: 0, message: 'The server took too long to respond. Please try again.', fieldErrors: {}, data: {} };
  return { status: 0, message: 'Cannot reach the server. Check your connection and try again.', fieldErrors: {}, data: {} };
};

export default api;
