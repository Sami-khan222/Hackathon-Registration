import api from './api';

export const signup = (payload) => api.post('/auth/signup', payload).then((r) => r.data);
export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload).then((r) => r.data);
export const resendOtp = (payload) => api.post('/auth/resend-otp', payload).then((r) => r.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const logout = () => api.post('/auth/logout').then((r) => r.data);
export const getMe = () => api.get('/user/me').then((r) => r.data);
export const updateProfile = (payload) => api.put('/user/update', payload).then((r) => r.data);
