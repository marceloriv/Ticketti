// Stubs para endpoints de donaciones usados por la UI localmente
export const getOrganizaciones = async () => [];
export const getCausasActivas = async () => [];
export const getTotalPorOrganizacion = async () => 0;
export const crearOrganizacion = async (payload) => ({ ...payload, idOrganizacion: Date.now() });
export const crearCausa = async (payload) => ({ ...payload, idCausa: Date.now() });
export const getCausasPorOrganizacion = async () => [];
export default {
  getOrganizaciones,
  getCausasActivas,
  getTotalPorOrganizacion,
  crearOrganizacion,
  crearCausa,
  getCausasPorOrganizacion,
};
