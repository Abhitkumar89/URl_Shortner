import api from './client.js';

export const linksApi = {
  list: (params) => api.get('/links', { params }).then((r) => r.data),
  create: (payload) => api.post('/shorten', payload).then((r) => r.data),
  remove: (id) => api.delete(`/links/${id}`).then((r) => r.data),
  analytics: (id) => api.get(`/analytics/${id}`).then((r) => r.data),
  qr: (id) => api.get(`/links/${id}/qr`).then((r) => r.data),
};
