/**
 * PRODUCT DETAIL ENTRY POINT (Facade / Controller Orchestration Layer)
 * Clean Code Principle: Facade Pattern & Orchestration.
 * Coordinates all UI controllers, maps product details to DOM elements,
 * handles edge cases (like product not found), and integrates with the favorites drawer.
 */

import { ELEMENTS } from './domElements.js';
import { obtenerProductoPorId } from './productData.js';
import { renderGallery } from './galleryController.js';
import { renderSizes } from './sizeSelector.js';
import { inicializarSelectorCantidad } from './quantitySelector.js';
import { inicializarAccionesCarrito } from './cartActions.js';
import { inicializarAcordeones } from './accordion.js';
import { inicializarAccionesCompartir } from './shareActions.js';
import { initMobileNavigation } from '../../js/components/navigation.js';
import { initFavorites, updateNavbarBadge } from '../../js/components/favorites.js';

document.addEventListener("DOMContentLoaded", () => {
  // Initialize general site features (Header navigation & Favorites drawer)
  initMobileNavigation();
  initFavorites();

  // Load and bootstrap product details
  bootstrapProductDetail();
});

/**
 * Parses query string, loads product data, and initializes view components.
 */
function bootstrapProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    showError("No se especificó ningún ID de producto en la URL.");
    return;
  }

  const producto = obtenerProductoPorId(productId);

  if (!producto) {
    showError(`El producto con ID "${productId}" no se encuentra en nuestro catálogo.`);
    return;
  }

  // Populate UI elements
  populateProductDetails(producto);

  // Initialize modular controllers
  renderGallery(producto.imagenes);
  renderSizes(producto.tallasDisponibles, producto.tallasNoDisponibles);
  inicializarSelectorCantidad();
  inicializarAccionesCarrito(producto);
  inicializarAcordeones();
  inicializarAccionesCompartir();
  inicializarFavoritosDetalle(producto);
}

/**
 * Populates static text, prices, and descriptions in the DOM.
 * @param {Object} producto - Unified product data contract.
 */
function populateProductDetails(producto) {
  const { 
    collection, 
    name, 
    code, 
    priceActual, 
    priceOriginal, 
    discountBadge,
    detailContainer,
    errorContainer 
  } = ELEMENTS;

  // Show details panel, hide error screen
  if (detailContainer) detailContainer.style.display = "grid";
  if (errorContainer) errorContainer.style.display = "none";

  if (collection) collection.textContent = producto.coleccion;
  if (name) name.textContent = producto.nombre;
  if (code) code.textContent = `Código: ${producto.codigo}`;

  // Prices formatting
  if (priceActual) priceActual.textContent = `S/ ${producto.precioActual.toFixed(2)}`;
  
  if (priceOriginal && priceOriginal !== producto.precioActual) {
    priceOriginal.textContent = `S/ ${producto.precioOriginal.toFixed(2)}`;
    priceOriginal.style.display = "inline";
  } else if (priceOriginal) {
    priceOriginal.style.display = "none";
  }

  // Discount percentage badge
  if (discountBadge) {
    if (producto.descuentoPorcentaje > 0) {
      discountBadge.textContent = `-${producto.descuentoPorcentaje}%`;
      discountBadge.style.display = "inline-block";
    } else {
      discountBadge.style.display = "none";
    }
  }

  // Description Accordion contents
  const descContentEl = document.getElementById("descContentText");
  if (descContentEl) {
    descContentEl.textContent = producto.descripcion;
  }

  // Model Info Accordion contents
  const modelContentEl = document.getElementById("modelContentText");
  if (modelContentEl) {
    modelContentEl.textContent = producto.informacionModelo;
  }
}

/**
 * Handles toggling and saving favorite state specifically for the details page panel.
 * @param {Object} producto - Unified product data contract.
 */
function inicializarFavoritosDetalle(producto) {
  const { favHeartBtn } = ELEMENTS;
  if (!favHeartBtn) return;

  const storageKey = 'topitop_favorites';
  const slugId = slugify(producto.nombre);

  const getFavs = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  // Update heart active class on load
  const isFavorite = () => getFavs().some(item => item.id === slugId);
  const actualizarIconoCorazon = () => {
    const icon = favHeartBtn.querySelector("i");
    if (isFavorite()) {
      favHeartBtn.classList.add("active");
      if (icon) icon.className = "fa-solid fa-heart";
    } else {
      favHeartBtn.classList.remove("active");
      if (icon) icon.className = "fa-regular fa-heart";
    }
  };

  actualizarIconoCorazon();

  // Click action
  favHeartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let favs = getFavs();
    const index = favs.findIndex(item => item.id === slugId);

    if (index === -1) {
      // Add
      const isAbsolute = producto.imagenes[0].includes('://') || producto.imagenes[0].startsWith('data:');
      // Strip parent folder prefix if relative, to save it consistently for the index.html page
      const cleanImgPath = isAbsolute ? producto.imagenes[0] : producto.imagenes[0].replace(/^(\.\.\/)+/, '');

      favs.push({
        id: slugId,
        nombre: producto.nombre,
        urlImagen: cleanImgPath,
        precio: `S/ ${producto.precioActual.toFixed(2)}`,
        tag: producto.coleccion,
        link: window.location.href
      });
      localStorage.setItem(storageKey, JSON.stringify(favs));
    } else {
      // Remove
      favs.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(favs));
    }

    actualizarIconoCorazon();
    updateNavbarBadge();
  });
}

/**
 * Helper to slugify product names for unique identifiers.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-')           // replace spaces with -
    .replace(/[^\w\-]+/g, '')       // remove all non-word chars
    .replace(/\-\-+/g, '-')         // replace multiple - with single -
    .replace(/^-+/, '')             // trim leading -
    .replace(/-+$/, '');            // trim trailing -
}

/**
 * Hides detail grid and displays a friendly error screen.
 * @param {string} msg - The error details to display.
 */
function showError(msg) {
  const { detailContainer, errorContainer, errorMessage } = ELEMENTS;
  
  if (detailContainer) detailContainer.style.display = "none";
  if (errorContainer) errorContainer.style.display = "block";
  if (errorMessage) errorMessage.textContent = msg;
}
