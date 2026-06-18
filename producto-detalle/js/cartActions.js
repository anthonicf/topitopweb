/**
 * CART ACTIONS CONTROLLER (UI Component / State Layer)
 * Clean Code Principle: SRP & Separation of Concerns.
 * Coordinates adding items to the cart and managing the cart button enabled/disabled states.
 */

import { ELEMENTS } from './domElements.js';
import { obtenerTallaSeleccionada } from './sizeSelector.js';
import { obtenerCantidad } from './quantitySelector.js';

let activeProduct = null;

/**
 * Initializes the cart button event listener.
 * @param {Object} producto - The active product details.
 */
export function inicializarAccionesCarrito(producto) {
  activeProduct = producto;
  const { addToCartBtn } = ELEMENTS;

  if (addToCartBtn) {
    // Recreate listener to avoid multiple click bindings if initialized multiple times
    const newBtn = addToCartBtn.cloneNode(true);
    addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
    ELEMENTS.addToCartBtn = newBtn;

    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      agregarAlCarrito();
    });
  }

  actualizarBotonCarrito();
}

/**
 * Updates the 'Add to Cart' button state depending on whether a size is selected.
 */
export function actualizarBotonCarrito() {
  const { addToCartBtn, sizeErrorMessage } = ELEMENTS;
  if (!addToCartBtn) return;

  const talla = obtenerTallaSeleccionada();

  if (talla) {
    addToCartBtn.removeAttribute("disabled");
    addToCartBtn.classList.remove("btn-disabled");
    if (sizeErrorMessage) {
      sizeErrorMessage.style.display = "none";
    }
  } else {
    addToCartBtn.setAttribute("disabled", "true");
    addToCartBtn.classList.add("btn-disabled");
  }
}

/**
 * Simulates adding the selected product details to the shopping cart.
 */
function agregarAlCarrito() {
  if (!activeProduct) return;

  const talla = obtenerTallaSeleccionada();
  const cantidad = obtenerCantidad();

  if (!talla) {
    const { sizeErrorMessage } = ELEMENTS;
    if (sizeErrorMessage) {
      sizeErrorMessage.style.display = "inline";
    }
    return;
  }

  const precioTotal = (activeProduct.precioActual * cantidad).toFixed(2);

  // Success alert
  alert(
    `¡Producto agregado al carrito!\n\n` +
    `Prenda: ${activeProduct.nombre}\n` +
    `Talla seleccionada: ${talla}\n` +
    `Cantidad: ${cantidad}\n` +
    `Precio Unitario: S/ ${activeProduct.precioActual.toFixed(2)}\n` +
    `Monto Total: S/ ${precioTotal}`
  );
}
