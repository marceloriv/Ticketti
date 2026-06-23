const isProd = import.meta.env.PROD;

/**
 * Logger condicional que solo muestra logs en desarrollo.
 * En producción, los logs se suprimen para no exponer información sensible.
 */
const logger = {
  log: (...args) => {
    if (!isProd) console.log(...args);
  },
  warn: (...args) => {
    if (!isProd) console.warn(...args);
  },
  error: (...args) => {
    if (!isProd) console.error(...args);
  },
  info: (...args) => {
    if (!isProd) console.info(...args);
  },
};

export default logger;
