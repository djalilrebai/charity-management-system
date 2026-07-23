import api from './api';

export async function fetchFamilyActivities(familyId) {
  const { data } = await api.get(`/families/${familyId}/activities`);
  return data;
}

export async function createFamilyActivity(familyId, payload) {
  const { data } = await api.post(`/families/${familyId}/activities`, payload);
  return data;
}

export async function updateFamilyActivity(id, payload) {
  const { data } = await api.put(`/family-activities/${id}`, payload);
  return data;
}

export async function deleteFamilyActivity(id) {
  const { data } = await api.delete(`/family-activities/${id}`);
  return data;
}
