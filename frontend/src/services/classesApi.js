import api from './api';

export async function fetchClasses(params = {}) {
  const { data } = await api.get('/classes', { params });
  return data;
}

export async function fetchClassById(id) {
  const { data } = await api.get(`/classes/${id}`);
  return data;
}

export async function createClass(payload) {
  const { data } = await api.post('/classes', payload);
  return data;
}

export async function updateClass(id, payload) {
  const { data } = await api.put(`/classes/${id}`, payload);
  return data;
}

export async function deleteClass(id) {
  const { data } = await api.delete(`/classes/${id}`);
  return data;
}
