import clienteApi from './clienteApi';

/**
 * Envía un mensaje del formulario de contacto al equipo Ticketti.
 * Ruta pública — no requiere JWT.
 *
 * @param {{ nombre: string, email: string, asunto: string, mensaje: string }} datos
 * @returns {Promise<void>}
 */
export const enviarMensajeContacto = async ({ nombre, email, asunto, mensaje }) => {
  await clienteApi.post('/notificaciones/contacto', {
    nombre,
    correo: email,
    asunto,
    mensaje,
  });
};
