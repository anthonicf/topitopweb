/**
 * Cart (Carrito de Compras) Component
 * Handles adding/removing/updating products in the cart, syncs with LocalStorage,
 * manages the sliding drawer UI, and updates navbar badges.
 * Mirrors the architecture and conventions of favorites.js for consistency.
 */

const STORAGE_KEY = 'topitop_cart';
const SHIPPING_COST = 12.90;
const FREE_SHIPPING_THRESHOLD = 150;

/**
 * Gets root prefix (../ or ../../) depending on current page depth
 */
function getRootPrefix() {
  const pathname = window.location.pathname;
  const lowerPath = pathname.toLowerCase();

  if (
    lowerPath.includes('/pages/hombrestoppage/') ||
    lowerPath.includes('/pages/mujerestop/') ||
    lowerPath.includes('/pages/kidstop/')
  ) {
    return '../../';
  } else if (lowerPath.includes('/pages/') || lowerPath.includes('/producto-detalle/')) {
    return '../';
  }
  return '';
}

/**
 * Cleans image URL to be root-relative if it is not absolute
 */
function getAbsoluteOrRootRelativeImg(imgSrc) {
  if (!imgSrc) return '';
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://') || imgSrc.startsWith('data:')) {
    return imgSrc;
  }
  return imgSrc.replace(/^(\.\.\/)+/, '');
}

/**
 * Returns current cart items from LocalStorage
 */
export function getCart() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Persists the cart array to LocalStorage
 */
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Returns total unit count of items in the cart (sum of quantities)
 */
export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.cantidad, 0);
}

/**
 * Returns the cart subtotal (sum of unitPrice * quantity)
 */
export function getCartSubtotal() {
  return getCart().reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
}

/**
 * Returns the shipping cost. Free shipping over the threshold, $0 for an empty cart.
 */
export function getShippingCost() {
  const cart = getCart();
  if (cart.length === 0) return 0;
  return getCartSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/**
 * Returns the cart grand total (subtotal + shipping)
 */
export function getCartTotal() {
  return getCartSubtotal() + getShippingCost();
}

/**
 * Adds a product (with a selected size and quantity) to the cart.
 * If the same product+size combination already exists, increases its quantity instead.
 * @param {Object} producto - Product detail contract (id, nombre, precioActual, imagenes, codigo, coleccion)
 * @param {string} talla - Selected size
 * @param {number} cantidad - Quantity to add
 */
export function addToCart(producto, talla, cantidad) {
  const cart = getCart();
  const lineId = `${producto.id}-${talla}`;
  const existing = cart.find(item => item.id === lineId);

  const rawImg = producto.imagenes && producto.imagenes[0] ? producto.imagenes[0] : '';
  const imagen = getAbsoluteOrRootRelativeImg(rawImg);

  if (existing) {
    existing.cantidad = Math.min(existing.cantidad + cantidad, 20);
  } else {
    cart.push({
      id: lineId,
      productId: producto.id,
      nombre: producto.nombre,
      talla,
      cantidad: Math.min(Math.max(cantidad, 1), 20),
      precioUnitario: producto.precioActual,
      imagen,
      codigo: producto.codigo || producto.id,
      coleccion: producto.coleccion || 'Topitop',
      link: window.location.href
    });
  }

  saveCart(cart);
  updateCartBadge();

  const drawer = document.getElementById('cart-drawer');
  if (drawer && drawer.classList.contains('open')) {
    renderCartList();
  }

  return lineId;
}

/**
 * Removes a line item from the cart entirely
 */
export function removeFromCart(lineId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== lineId);
  saveCart(cart);
  updateCartBadge();
  renderCartList();
}

/**
 * Updates the quantity of a specific line item. Removes it if quantity drops below 1.
 */
export function setQuantity(lineId, newQuantity) {
  let cart = getCart();
  const item = cart.find(i => i.id === lineId);
  if (!item) return;

  if (newQuantity < 1) {
    cart = cart.filter(i => i.id !== lineId);
  } else {
    item.cantidad = Math.min(newQuantity, 20);
  }

  saveCart(cart);
  updateCartBadge();
  renderCartList();
}

/**
 * Empties the cart completely (used after a successful checkout)
 */
export function clearCart() {
  saveCart([]);
  updateCartBadge();
  const drawer = document.getElementById('cart-drawer');
  if (drawer && drawer.classList.contains('open')) {
    renderCartList();
  }
}

/**
 * Injects the cart drawer + overlay markup if not already present
 */
function injectDrawerHTML() {
  if (document.getElementById('cart-drawer-container')) return;

  const container = document.createElement('div');
  container.id = 'cart-drawer-container';
  container.innerHTML = `
    <div class="cart-drawer-overlay" id="cart-drawer-overlay"></div>
    <div class="cart-drawer" id="cart-drawer">
      <div class="cart-drawer-header">
        <h3><i class="fa-solid fa-bag-shopping"></i> Mi Carrito</h3>
        <button class="cart-drawer-close" id="cart-drawer-close" aria-label="Cerrar carrito">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="cart-drawer-content" id="cart-drawer-content">
        <!-- Rendered dynamically -->
      </div>
      <div class="cart-drawer-footer" id="cart-drawer-footer">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
  document.body.appendChild(container);

  document.getElementById('cart-drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('cart-drawer-overlay').addEventListener('click', closeDrawer);
}

/**
 * Opens the sliding Cart drawer
 */
export function openDrawer() {
  injectDrawerHTML();
  renderCartList();

  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');

  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('drawer-lock-scroll');
  }
}

/**
 * Closes the sliding Cart drawer
 */
export function closeDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');

  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('drawer-lock-scroll');
  }
}

/**
 * Populates the list and footer summary inside the Cart Drawer
 */
function renderCartList() {
  const content = document.getElementById('cart-drawer-content');
  const footer = document.getElementById('cart-drawer-footer');
  if (!content || !footer) return;

  const cart = getCart();

  if (cart.length === 0) {
    content.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Tu carrito está vacío.</p>
        <span style="font-size:0.82rem;color:#999;max-width:240px;line-height:1.4;">Explora la colección y agrega las prendas que más te gusten.</span>
      </div>
    `;
    footer.innerHTML = '';
    return;
  }

  const rootPrefix = getRootPrefix();
  let html = '';

  cart.forEach(item => {
    const finalImgSrc = (item.imagen.startsWith('http://') || item.imagen.startsWith('https://') || item.imagen.startsWith('data:'))
      ? item.imagen
      : `${rootPrefix}${item.imagen}`;

    html += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${finalImgSrc}" alt="${item.nombre}" class="cart-item-img">
        <div class="cart-item-details">
          <span class="cart-item-tag">${item.coleccion}</span>
          <h4 class="cart-item-title">${item.nombre}</h4>
          <span class="cart-item-size">Talla: <strong>${item.talla}</strong></span>
          <div class="cart-item-bottom-row">
            <div class="cart-qty-stepper" data-id="${item.id}">
              <button class="cart-qty-btn cart-qty-decrease" aria-label="Disminuir cantidad">-</button>
              <span class="cart-qty-value">${item.cantidad}</span>
              <button class="cart-qty-btn cart-qty-increase" aria-label="Aumentar cantidad">+</button>
            </div>
            <span class="cart-item-price">S/ ${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
          </div>
        </div>
        <button class="cart-item-remove" aria-label="Eliminar del carrito" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  });

  content.innerHTML = html;

  const subtotal = getCartSubtotal();
  const shipping = getShippingCost();
  const total = getCartTotal();
  const missingForFree = FREE_SHIPPING_THRESHOLD - subtotal;

  footer.innerHTML = `
    ${missingForFree > 0 ? `<p class="cart-free-shipping-hint"><i class="fa-solid fa-truck-fast"></i> Te faltan <strong>S/ ${missingForFree.toFixed(2)}</strong> para envío gratis</p>` : `<p class="cart-free-shipping-hint success"><i class="fa-solid fa-circle-check"></i> ¡Tienes envío gratis!</p>`}
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
    <button class="btn-primary cart-checkout-btn" id="cart-checkout-btn">Proceder al pago</button>
  `;

  // Quantity steppers
  content.querySelectorAll('.cart-qty-decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.cart-qty-stepper').dataset.id;
      const item = getCart().find(i => i.id === id);
      if (item) setQuantity(id, item.cantidad - 1);
    });
  });
  content.querySelectorAll('.cart-qty-increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.cart-qty-stepper').dataset.id;
      const item = getCart().find(i => i.id === id);
      if (item) setQuantity(id, item.cantidad + 1);
    });
  });

  // Remove buttons
  content.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
    });
  });

  // Checkout button
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.location.href = `${rootPrefix}checkout.html`;
    });
  }
}

/**
 * Updates count badge on navigation bar
 */
export function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll('.cart-badge');

  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  });
}

/**
 * Shows a small floating confirmation toast (e.g. "Producto agregado al carrito")
 */
export function showCartToast(message, iconClass = 'fa-solid fa-circle-check') {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'cart-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
  toast.classList.add('visible');

  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2600);
}

/**
 * Dynamic event bindings for the cart icon in every page's header
 */
function setupNavbarTriggers() {
  const bagIcons = document.querySelectorAll('.header-actions a i.fa-bag-shopping');

  bagIcons.forEach(icon => {
    const link = icon.closest('a');
    if (!link) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });

    if (!link.querySelector('.cart-badge')) {
      const badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.textContent = '0';
      link.appendChild(badge);
    }
  });

  updateCartBadge();
}

/**
 * Initializes the cart system. Safe to call on every page (idempotent).
 */
export function initCart() {
  injectDrawerHTML();
  setupNavbarTriggers();
}
