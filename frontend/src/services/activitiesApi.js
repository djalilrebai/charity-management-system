import api from './api';

export async function fetchActivities(search = '') {
  const { data } = await api.get('/activities', { params: { search } });
  return data;
}

export async function fetchActivityById(id) {
  const { data } = await api.get(`/activities/${id}`);
  return data;
}

export async function createActivity(payload) {
  const { data } = await api.post('/activities', payload);
  return data;
}

export async function updateActivity(id, payload) {
  const { data } = await api.put(`/activities/${id}`, payload);
  return data;
}

export async function deleteActivity(id) {
  const { data } = await api.delete(`/activities/${id}`);
  return data;
}
