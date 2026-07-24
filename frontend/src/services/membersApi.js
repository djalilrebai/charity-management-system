import api from './api';

export async function fetchMembers(search = '') {
  const { data } = await api.get('/members', { params: { search } });
  return data;
}

export async function createMember(payload) {
  const { data } = await api.post('/members', payload);
  return data;
}

export async function updateMember(id, payload) {
  const { data } = await api.put(`/members/${id}`, payload);
  return data;
}

export async function deleteMember(id) {
  const { data } = await api.delete(`/members/${id}`);
  return data;
}

export async function createAccountForMember(id, payload) {
  const { data } = await api.post(`/members/${id}/create-account`, payload);
  return data;
}
