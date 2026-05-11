import api from './api';

// ── Organizaciones ──────────────────────────────────

export const getOrganizaciones = async () => {
  const res = await api.get('/organizaciones');
  return res.data;
};

export const getOrganizacionPorId = async (id) => {
  const res = await api.get(`/organizaciones/${id}`);
  return res.data;
};

export const crearOrganizacion = async (data) => {
  const res = await api.post('/organizaciones', data);
  return res.data;
};

export const actualizarOrganizacion = async (id, data) => {
  const res = await api.put(`/organizaciones/${id}`, data);
  return res.data;
};

export const desactivarOrganizacion = async (id) => {
  await api.delete(`/organizaciones/${id}`);
};

// ── Causas Sociales ──────────────────────────────────

export const getCausasActivas = async () => {
  const res = await api.get('/causas/activas');
  return res.data;
};

export const getCausasPorOrganizacion = async (idOrganizacion) => {
  const res = await api.get(`/causas/organizacion/${idOrganizacion}`);
  return res.data;
};

export const crearCausa = async (data) => {
  const res = await api.post('/causas', data);
  return res.data;
};

// ── Donaciones ───────────────────────────────────────

export const getDonacionesPorOrganizacion = async (id) => {
  const res = await api.get(`/donaciones/organizacion/${id}`);
  return res.data;
};

export const getDonacionesPorCausa = async (id) => {
  const res = await api.get(`/donaciones/causa/${id}`);
  return res.data;
};

export const getTotalPorOrganizacion = async (id) => {
  const res = await api.get(`/donaciones/total/organizacion/${id}`);
  return res.data;
};

export const getTotalPorCausa = async (id) => {
  const res = await api.get(`/donaciones/total/causa/${id}`);
  return res.data;
};