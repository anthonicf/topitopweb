/**
 * UTILS layer - Reusable validation helper functions.
 * Clean Code: Pure functions, zero side-effects, clear verb-noun names.
 */

/**
 * Valida si un valor es un string no vacío.
 * @param {*} value 
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida si un string tiene una longitud mínima.
 * @param {string} value 
 * @param {number} minLength 
 * @returns {boolean}
 */
export function hasMinLength(value, minLength) {
  if (typeof value !== 'string') return false;
  return value.trim().length >= minLength;
}

/**
 * Valida si un valor es un número positivo (mayor o igual a cero).
 * @param {*} value 
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  const numberValue = Number(value);
  return !isNaN(numberValue) && numberValue >= 0;
}

/**
 * Valida si un número de descuento está en el rango correcto (0 a 100).
 * @param {*} value 
 * @returns {boolean}
 */
export function isValidDiscountPercentage(value) {
  if (value === null || value === undefined || value === '') return true; // Descuento opcional
  const numberValue = Number(value);
  return !isNaN(numberValue) && numberValue >= 0 && numberValue <= 100;
}

/**
 * Valida el formato de una dirección URL.
 * @param {string} urlString 
 * @returns {boolean}
 */
export function isValidUrl(urlString) {
  if (!isNonEmptyString(urlString)) return false;
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    // Comentario del PORQUÉ: Capturamos el error del constructor URL porque el formato no es válido.
    return false;
  }
}

/**
 * Valida si una URL apunta a un formato de imagen común.
 * @param {string} imageUrlString 
 * @returns {boolean}
 */
export function isValidImageUrl(imageUrlString) {
  if (!isValidUrl(imageUrlString)) return false;
  
  // Limpiamos parámetros de consulta para la validación de la extensión
  const urlWithoutParams = imageUrlString.split('?')[0];
  const imageRegex = /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i;
  
  // Aceptamos urls que terminen en extensión o que contengan patrones comunes de CDN de imágenes
  return imageRegex.test(urlWithoutParams) || imageUrlString.includes('images') || imageUrlString.includes('placeholder');
}

/**
 * Valida si un correo electrónico tiene formato correcto.
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!isNonEmptyString(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
