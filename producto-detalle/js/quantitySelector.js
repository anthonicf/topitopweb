/**
 * QUANTITY SELECTOR CONTROLLER (UI Component / State Layer)
 * Clean Code Principle: SRP & Encapsulation.
 * Manages quantity counting state (+/- buttons) and validates constraints.
 */

import { ELEMENTS } from './domElements.js';

let currentQuantity = 1;

/**
 * Returns the currently selected quantity.
 * @returns {number}
 */
export function obtenerCantidad() {
  return currentQuantity;
}

/**
 * Resets the quantity to 1 and updates the UI.
 */
export function reiniciarCantidad() {
  currentQuantity = 1;
  actualizarUI();
}

/**
 * Binds click listeners to quantity modifier buttons.
 */
export function inicializarSelectorCantidad() {
  const { quantityDecreaseBtn, quantityIncreaseBtn } = ELEMENTS;

  if (quantityDecreaseBtn) {
    quantityDecreaseBtn.addEventListener("click", () => {
      if (currentQuantity > 1) {
        currentQuantity--;
        actualizarUI();
      }
    });
  }

  if (quantityIncreaseBtn) {
    quantityIncreaseBtn.addEventListener("click", () => {
      currentQuantity++;
      actualizarUI();
    });
  }

  actualizarUI();
}

/**
 * Syncs the JS state to the DOM elements.
 */
function actualizarUI() {
  const { quantityInput, quantityDecreaseBtn } = ELEMENTS;

  if (quantityInput) {
    quantityInput.value = currentQuantity;
  }

  if (quantityDecreaseBtn) {
    if (currentQuantity === 1) {
      quantityDecreaseBtn.classList.add("btn-disabled");
      quantityDecreaseBtn.setAttribute("disabled", "true");
    } else {
      quantityDecreaseBtn.classList.remove("btn-disabled");
      quantityDecreaseBtn.removeAttribute("disabled");
    }
  }
}
