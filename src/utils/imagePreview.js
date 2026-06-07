import { isValidImageUrl } from './validators.js';

/**
 * UTILS layer - Helper to bind text URL inputs to image preview HTML elements.
 * Clean Code: Clear event-driven functions, validates inputs first.
 */

const FALLBACK_PLACEHOLDER = 'https://placehold.co/150?text=Sin+Imagen';

/**
 * Configura la vista previa de imagen en tiempo real para un formulario modal.
 * @param {HTMLInputElement} urlInputElement 
 * @param {HTMLImageElement} previewImageElement 
 */
export function bindImagePreview(urlInputElement, previewImageElement) {
  if (!urlInputElement || !previewImageElement) return;

  const updatePreview = () => {
    const imageUrl = urlInputElement.value.trim();
    
    if (isValidImageUrl(imageUrl)) {
      previewImageElement.src = imageUrl;
    } else {
      previewImageElement.src = FALLBACK_PLACEHOLDER;
    }
  };

  // Escuchamos tanto input (escritura) como change (pegar)
  urlInputElement.addEventListener('input', updatePreview);
  urlInputElement.addEventListener('change', updatePreview);
}
