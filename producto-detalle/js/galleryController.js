/**
 * GALLERY CONTROLLER (View/UI Component Layer)
 * Clean Code Principle: Single Responsibility Principle (SRP).
 * Manages rendering the dynamic thumbnail gallery and handling the image swap state.
 */

import { ELEMENTS } from './domElements.js';

/**
 * Renders the image gallery.
 * @param {string[]} imagenes - Array of image URLs for the product.
 */
export function renderGallery(imagenes) {
  const { mainImage, thumbnailsContainer } = ELEMENTS;
  
  if (!mainImage || !thumbnailsContainer) return;

  // Clear previous thumbnails
  thumbnailsContainer.innerHTML = "";

  // Guard against empty image array by showing a placeholder
  if (!imagenes || imagenes.length === 0) {
    const placeholderUrl = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=500";
    mainImage.src = placeholderUrl;
    return;
  }

  // Populate thumbnails dynamically
  imagenes.forEach((urlImagen, index) => {
    const thumbnail = document.createElement("img");
    thumbnail.src = urlImagen;
    thumbnail.alt = `Miniatura del producto ${index + 1}`;
    thumbnail.classList.add("product-thumbnail");
    
    // First thumbnail is active by default
    if (index === 0) {
      thumbnail.classList.add("thumbnail-active");
    }

    thumbnail.addEventListener("click", () => activarMiniatura(thumbnail, urlImagen));
    thumbnailsContainer.appendChild(thumbnail);
  });

  // Set initial main image
  mainImage.src = imagenes[0];
}

/**
 * Handles switching the main image source and applying active thumbnail classes.
 * @param {HTMLImageElement} thumbnailClickeada - The thumbnail image element that was clicked.
 * @param {string} urlImagen - The source URL to apply to the main image.
 */
function activarMiniatura(thumbnailClickeada, urlImagen) {
  const { mainImage } = ELEMENTS;
  if (mainImage) {
    mainImage.src = urlImagen;
  }
  
  document.querySelectorAll(".product-thumbnail").forEach(thumb => {
    thumb.classList.remove("thumbnail-active");
  });
  
  thumbnailClickeada.classList.add("thumbnail-active");
}
