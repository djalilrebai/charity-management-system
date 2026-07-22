import api from './api';

export async function fetchChildrenByFamily(familyId) {
  const { data } = await api.get(`/families/${familyId}/children`);
  return data;
}

export async function createChild(familyId, payload) {
  const { data } = await api.post(`/families/${familyId}/children`, payload);
  return data;
}

export async function updateChild(id, payload) {
  const { data } = await api.put(`/children/${id}`, payload);
  return data;
}

export async function deleteChild(id) {
  const { data } = await api.delete(`/children/${id}`);
  return data;
}
