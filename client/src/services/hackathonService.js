import api from './api';

export const getOptions = () => api.get('/hackathon/options').then((r) => r.data);
export const registerForHackathon = (payload) => api.post('/hackathon/register', payload).then((r) => r.data);
export const getMyEntry = () => api.get('/hackathon/my-entry').then((r) => r.data);
export const deleteEntry = (id) => api.delete(`/hackathon/${id}`).then((r) => r.data);
export const sendContactMessage = (payload) => api.post('/contact', payload).then((r) => r.data);
