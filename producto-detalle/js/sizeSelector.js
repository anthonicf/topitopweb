/**
 * SIZE SELECTOR CONTROLLER (UI Component / State Layer)
 * Clean Code Principle: SRP & State-driven UI.
 * Manages the available sizes buttons, selection states, and triggers
 * Cart button status changes based on selection.
 */

import { ELEMENTS } from './domElements.js';
import { actualizarBotonCarrito } from './cartActions.js';

let selectedSize = null;

/**
 * Returns the currently selected size.
 * @returns {string|null}
 */
export function obtenerTallaSeleccionada() {
  return selectedSize;
}

/**
 * Resets the selection state.
 */
export function reiniciarSeleccionTalla() {
  selectedSize = null;
  actualizarBotonCarrito();
}

/**
 * Renders the size selector buttons dynamically.
 * @param {string[]} tallasDisponibles - Available sizes.
 * @param {string[]} tallasNoDisponibles - Out-of-stock sizes.
 */
export function renderSizes(tallasDisponibles = [], tallasNoDisponibles = []) {
  const { sizeContainer, sizeErrorMessage } = ELEMENTS;
  
  if (!sizeContainer) return;

  sizeContainer.innerHTML = "";
  selectedSize = null;

  // Render available sizes
  tallasDisponibles.forEach(talla => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "size-btn";
    btn.textContent = talla;
    btn.setAttribute("aria-label", `Talla ${talla}`);

    btn.addEventListener("click", () => {
      // Toggle selection state
      if (selectedSize === talla) {
        btn.classList.remove("size-selected");
        selectedSize = null;
        if (sizeErrorMessage) sizeErrorMessage.style.display = "inline";
      } else {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("size-selected"));
        btn.classList.add("size-selected");
        selectedSize = talla;
        if (sizeErrorMessage) sizeErrorMessage.style.display = "none";
      }
      actualizarBotonCarrito();
    });

    sizeContainer.appendChild(btn);
  });

  // Render unavailable sizes
  tallasNoDisponibles.forEach(talla => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "size-btn size-disabled";
    btn.textContent = talla;
    btn.disabled = true;
    btn.setAttribute("aria-label", `Talla ${talla} no disponible`);
    sizeContainer.appendChild(btn);
  });

  // Ensure cart button starts disabled
  actualizarBotonCarrito();
}
