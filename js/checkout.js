/**
 * CHECKOUT PAGE CONTROLLER
 * Orchestrates the shipping + payment form, renders the live order summary from the
 * real cart (LocalStorage), validates input, and simulates a payment confirmation flow.
 */

import { initMobileNavigation } from './components/navigation.js';
import { initFavorites } from './components/favorites.js';
import { initCart, getCart, getCartSubtotal, getShippingCost, getCartTotal, clearCart } from './components/cart.js';
import { initFooterAcordeon } from './components/footerAcordeon.js';

let selectedMethod = 'tarjeta';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initFavorites();
  initCart();
  initFooterAcordeon();

  bootstrapCheckout();
});

function bootstrapCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    document.getElementById('checkoutFormState').style.display = 'none';
    document.getElementById('checkoutEmptyState').style.display = 'flex';
    return;
  }

  renderOrderSummary();
  setupPaymentTabs();
  setupInputMasks();
  setupSubmit();
}

/**
 * Renders the list of cart items and totals in the right-hand summary card.
 */
function renderOrderSummary() {
  const cart = getCart();
  const itemsContainer = document.getElementById('orderSummaryItems');
  const totalsContainer = document.getElementById('orderSummaryTotals');

  let html = '';
  cart.forEach(item => {
    const imgSrc = (item.imagen.startsWith('http://') || item.imagen.startsWith('https://') || item.imagen.startsWith('data:'))
      ? item.imagen
      : item.imagen; // checkout.html lives at the project root, so root-relative paths work as-is

    html += `
      <div class="summary-item-row">
        <img src="${imgSrc}" alt="${item.nombre}" class="summary-item-img">
        <div class="summary-item-info">
          <span class="summary-item-name">${item.nombre}</span>
          <span class="summary-item-meta">Talla ${item.talla} · Cant. ${item.cantidad}</span>
        </div>
        <span class="summary-item-price">S/ ${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
      </div>
    `;
  });
  itemsContainer.innerHTML = html;

  const subtotal = getCartSubtotal();
  const shipping = getShippingCost();
  const total = getCartTotal();

  totalsContainer.innerHTML = `
    <div class="cart-summary-row">
      <span>Subtotal</span>
      <span>S/ ${subtotal.toFixed(2)}</span>
    </div>
    <div class="cart-summary-row">
      <span>Envío</span>
      <span>${shipping === 0 ? 'Gratis' : `S/ ${shipping.toFixed(2)}`}</span>
    </div>
    <div class="cart-summary-row cart-summary-total">
      <span>Total</span>
      <span>S/ ${total.toFixed(2)}</span>
    </div>
  `;
}

/**
 * Wires up the payment method tab switcher (Tarjeta / Yape / Plin)
 */
function setupPaymentTabs() {
  const tabs = document.querySelectorAll('.payment-tab');
  const panels = document.querySelectorAll('.payment-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const method = tab.dataset.method;
      selectedMethod = method;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => p.classList.remove('active'));
      const targetPanel = document.getElementById(`panel-${method}`);
      if (targetPanel) targetPanel.classList.add('active');

      clearAllFieldErrors();
    });
  });
}

/**
 * Adds light input masking/formatting for card number and expiry fields.
 */
function setupInputMasks() {
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      let digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
      cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', () => {
      let digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length > 2) {
        cardExpiry.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        cardExpiry.value = digits;
      }
    });
  }

  const cardCvv = document.getElementById('cardCvv');
  if (cardCvv) {
    cardCvv.addEventListener('input', () => {
      cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  ['shipPhone', 'yapePhone', 'plinPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.value = el.value.replace(/\D/g, '').slice(0, 9);
      });
    }
  });
}

/**
 * Marks a form-group as invalid/valid, toggling the visible error message.
 */
function setFieldValidity(inputEl, isValid) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.toggle('invalid', !isValid);
}

function clearAllFieldErrors() {
  document.querySelectorAll('.form-group.invalid').forEach(g => g.classList.remove('invalid'));
}

/**
 * Validates the shipping address form. Returns true if all required fields are valid.
 */
function validateShipping() {
  let valid = true;

  const requiredFields = ['shipFullName', 'shipAddress', 'shipDepartamento', 'shipDistrito'];
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    const ok = el.value.trim().length > 1;
    setFieldValidity(el, ok);
    if (!ok) valid = false;
  });

  const phoneEl = document.getElementById('shipPhone');
  const phoneOk = phoneEl.value.trim().length === 9;
  setFieldValidity(phoneEl, phoneOk);
  if (!phoneOk) valid = false;

  return valid;
}

/**
 * Validates whichever payment method is currently selected.
 */
function validatePayment() {
  let valid = true;

  if (selectedMethod === 'tarjeta') {
    const name = document.getElementById('cardName');
    const number = document.getElementById('cardNumber');
    const expiry = document.getElementById('cardExpiry');
    const cvv = document.getElementById('cardCvv');

    const nameOk = name.value.trim().length > 2;
    setFieldValidity(name, nameOk);
    if (!nameOk) valid = false;

    const digits = number.value.replace(/\D/g, '');
    const numberOk = digits.length === 16;
    setFieldValidity(number, numberOk);
    if (!numberOk) valid = false;

    const expiryOk = /^\d{2}\/\d{2}$/.test(expiry.value) && Number(expiry.value.split('/')[0]) >= 1 && Number(expiry.value.split('/')[0]) <= 12;
    setFieldValidity(expiry, expiryOk);
    if (!expiryOk) valid = false;

    const cvvOk = cvv.value.trim().length >= 3;
    setFieldValidity(cvv, cvvOk);
    if (!cvvOk) valid = false;

  } else if (selectedMethod === 'yape') {
    const phone = document.getElementById('yapePhone');
    const ok = phone.value.trim().length === 9;
    setFieldValidity(phone, ok);
    if (!ok) valid = false;

  } else if (selectedMethod === 'plin') {
    const phone = document.getElementById('plinPhone');
    const ok = phone.value.trim().length === 9;
    setFieldValidity(phone, ok);
    if (!ok) valid = false;
  }

  return valid;
}

/**
 * Wires up the "Finalizar compra" button: validates, simulates processing, and shows the
 * success screen while clearing the cart.
 */
function setupSubmit() {
  const btn = document.getElementById('checkoutSubmitBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const shippingOk = validateShipping();
    const paymentOk = validatePayment();

    if (!shippingOk || !paymentOk) {
      const firstInvalid = document.querySelector('.form-group.invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    processOrder();
  });
}

/**
 * Simulates a payment processing delay, then shows the confirmation screen.
 */
function processOrder() {
  const overlay = document.getElementById('checkoutProcessingOverlay');
  overlay.style.display = 'flex';

  setTimeout(() => {
    overlay.style.display = 'none';
    showSuccessState();
  }, 1600);
}

/**
 * Displays the final confirmation screen with a generated order number and clears the cart.
 */
function showSuccessState() {
  const total = getCartTotal();
  const distrito = document.getElementById('shipDistrito').value.trim();
  const departamento = document.getElementById('shipDepartamento').value;
  const address = document.getElementById('shipAddress').value.trim();

  const methodLabels = {
    tarjeta: 'Tarjeta de crédito/débito',
    yape: 'Yape',
    plin: 'Plin'
  };

  const orderNumber = `TOP-${Date.now().toString().slice(-8)}`;

  document.getElementById('successOrderNumber').textContent = orderNumber;
  document.getElementById('successPaymentMethod').textContent = methodLabels[selectedMethod] || selectedMethod;
  document.getElementById('successTotal').textContent = `S/ ${total.toFixed(2)}`;
  document.getElementById('successAddress').textContent = `${address}, ${distrito}, ${departamento}`;

  document.getElementById('checkoutFormState').style.display = 'none';
  document.getElementById('checkoutSuccessState').style.display = 'flex';

  const steps = document.querySelectorAll('.checkout-step');
  steps.forEach(s => {
    s.classList.add('completed');
    s.classList.remove('active');
  });
  const lastStep = document.querySelector('.checkout-step[data-step="3"]');
  if (lastStep) lastStep.classList.add('active');

  clearCart();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
