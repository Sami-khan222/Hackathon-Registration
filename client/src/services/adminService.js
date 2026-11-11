import api from './api';

export const getStats = () => api.get('/admin/stats').then((r) => r.data);
export const getRegistrations = (params) => api.get('/admin/registrations', { params }).then((r) => r.data);
export const getCancellations = (params) => api.get('/admin/cancellations', { params }).then((r) => r.data);

/** CSV download (cookie ke saath, isliye blob se download karte hain). */
export const exportRegistrationsCsv = async () => {
  const res = await api.get('/admin/registrations/export', { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hackathon-registrations.csv';
  a.click();
  URL.revokeObjectURL(url);
};