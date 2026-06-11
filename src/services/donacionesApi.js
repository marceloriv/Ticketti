import donacionesApi from '../api/donacionesApi';

/**
 * Re-exportación para mantener compatibilidad con imports existentes en la aplicación
 * que referencian a @services/donacionesApi.
 */
export * from '../api/donacionesApi';
export default donacionesApi;
