import api from './api';

// ---- المداخيل ----
export async function fetchIncomes(params = {}) {
  const { data } = await api.get('/income', { params });
  return data;
}
export async function createIncome(payload) {
  const { data } = await api.post('/income', payload);
  return data;
}
export async function updateIncome(id, payload) {
  const { data } = await api.put(`/income/${id}`, payload);
  return data;
}
export async function deleteIncome(id) {
  const { data } = await api.delete(`/income/${id}`);
  return data;
}

// ---- المصاريف ----
export async function fetchExpenses(params = {}) {
  const { data } = await api.get('/expenses', { params });
  return data;
}
export async function createExpense(payload) {
  const { data } = await api.post('/expenses', payload);
  return data;
}
export async function updateExpense(id, payload) {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
}
export async function deleteExpense(id) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}

// ---- الملخص ----
export async function fetchFinanceSummary(params = {}) {
  const { data } = await api.get('/finance/summary', { params });
  return data;
}
