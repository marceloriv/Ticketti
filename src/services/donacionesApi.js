import api from './api';

// ── Organizaciones ──────────────────────────────────

export const getOrganizaciones = async () => {
  const res = await api.get('/v1/organizaciones');
  return res.data;
};

export const getOrganizacionPorId = async (id) => {
  const res = await api.get(`/v1/organizaciones/${id}`);
  return res.data;
};

export const crearOrganizacion = async (data) => {
  const res = await api.post('/v1/organizaciones', data);
  return res.data;
};

export const actualizarOrganizacion = async (id, data) => {
  const res = await api.put(`/v1/organizaciones/${id}`, data);
  return res.data;
};

export const desactivarOrganizacion = async (id) => {
  await api.delete(`/v1/organizaciones/${id}`);
};

// ── Causas Sociales ──────────────────────────────────

export const getCausasActivas = async () => {
  const res = await api.get('/v1/causas/activas');
  return res.data;
};

export const getCausasPorOrganizacion = async (idOrganizacion) => {
  const res = await api.get(`/v1/causas/organizacion/${idOrganizacion}`);
  return res.data;
};

export const crearCausa = async (data) => {
  const res = await api.post('/v1/causas', data);
  return res.data;
};

// ── Donaciones ───────────────────────────────────────

export const getDonacionesPorOrganizacion = async (id) => {
  const res = await api.get(`/v1/donaciones/organizacion/${id}`);
  return res.data;
};

export const getDonacionesPorCausa = async (id) => {
  const res = await api.get(`/v1/donaciones/causa/${id}`);
  return res.data;
};

export const getTotalPorOrganizacion = async (id) => {
  const res = await api.get(`/v1/donaciones/total/organizacion/${id}`);
  return res.data;
};

export const getTotalPorCausa = async (id) => {
  const res = await api.get(`/v1/donaciones/total/causa/${id}`);
  return res.data;
};