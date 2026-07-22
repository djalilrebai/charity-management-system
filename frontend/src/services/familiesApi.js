import api from './api';

export async function fetchFamilies({ search = '', categorie = '', page = 1, limit = 20 }) {
  const { data } = await api.get('/families', {
    params: { search, categorie, page, limit },
  });
  return data;
}

export async function fetchFamilyById(id) {
  const { data } = await api.get(`/families/${id}`);
  return data;
}

export async function createFamily(payload) {
  const { data } = await api.post('/families', payload);
  return data;
}

export async function updateFamily(id, payload) {
  const { data } = await api.put(`/families/${id}`, payload);
  return data;
}

export async function deleteFamily(id) {
  const { data } = await api.delete(`/families/${id}`);
  return data;
}