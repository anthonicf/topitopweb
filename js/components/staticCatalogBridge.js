/**
 * STATIC CATALOG BRIDGE
 * Several category pages (Pages/HombresTopPage, Pages/MujeresTop, Pages/KidsTop) render
 * their product grid as static hardcoded HTML instead of through ProductRepository.
 * Those cards were never wired to navigate to the product detail page, so clicking them
 * did nothing. This module detects that pattern, registers each card as a real catalog
 * product (so it can be opened, added to the cart, checked out, etc.) and wires the click
 * navigation - without touching any existing markup, styles, or other functionality.
 */

const CATALOG_KEY = 'topitop_products';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Root-relative prefix for reaching /producto-detalle/ from the current page depth.
 */
function getDetailPagePrefix() {
  const lowerPath = window.location.pathname.toLowerCase();

  if (
    lowerPath.includes('/pages/hombrestoppage/') ||
    lowerPath.includes('/pages/mujerestop/') ||
    lowerPath.includes('/pages/kidstop/')
  ) {
    return '../../producto-detalle/producto-detalle.html';
  } else if (lowerPath.includes('/pages/') || lowerPath.includes('/producto-detalle/')) {
    return '../producto-detalle/producto-detalle.html';
  }
  return 'producto-detalle/producto-detalle.html';
}

/**
 * Derives a stable collection label from the current page path, purely for display.
 */
function getCollectionLabelFromPath() {
  const lowerPath = window.location.pathname.toLowerCase();
  if (lowerPath.includes('/hombrestoppage/')) return 'hombre';
  if (lowerPath.includes('/mujerestop/')) return 'mujer';
  if (lowerPath.includes('/kidstop/')) return 'kids';
  return 'colección';
}

function getCatalog() {
  const data = localStorage.getItem(CATALOG_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCatalog(catalog) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

/**
 * Reads the visible fields off a .product-card-custom element.
 */
function extractCardData(card) {
  const nombre = card.querySelector('.card-title')?.textContent.trim() || '';
  const urlImagen = card.querySelector('.card-img-wrap img')?.getAttribute('src') || '';
  const tag = card.querySelector('.card-tag')?.textContent.trim() || 'Moda Premium';
  const precioText = card.querySelector('.price-current')?.textContent.replace(/[^\d.,]/g, '').replace(',', '.') || '0';
  const precioOldText = card.querySelector('.price-old')?.textContent.replace(/[^\d.,]/g, '').replace(',', '.') || '';
  const badgeText = card.querySelector('.card-badge')?.textContent.trim() || '';

  const precio = parseFloat(precioText) || 0;
  const precioOriginal = precioOldText ? parseFloat(precioOldText) : precio;

  let descuento = 0;
  const badgeMatch = badgeText.match(/-?(\d+)%/);
  if (badgeMatch) {
    descuento = parseInt(badgeMatch[1], 10);
  } else if (precioOriginal > precio) {
    descuento = Math.round(((precioOriginal - precio) / precioOriginal) * 100);
  }

  return { nombre, urlImagen, tag, precio, precioOriginal, descuento };
}

/**
 * Ensures every static .product-card-custom without a data-product-id gets one,
 * and that its data is registered in the shared product catalog in LocalStorage.
 */
function registerStaticCards() {
  const cards = document.querySelectorAll('.product-card-custom:not([data-product-id])');
  if (cards.length === 0) return;

  const catalog = getCatalog();
  const collectionId = getCollectionLabelFromPath();
  let changed = false;

  cards.forEach(card => {
    const { nombre, urlImagen, tag, precio, precioOriginal, descuento } = extractCardData(card);
    if (!nombre || !urlImagen) return;

    const id = `local-${slugify(nombre)}`;
    card.dataset.productId = id;

    const alreadyExists = catalog.some(p => p.id === id);
    if (!alreadyExists) {
      catalog.push({
        id,
        nombre,
        urlImagen,
        precio,
        precioOriginal,
        descuento,
        tallas: ["S", "M", "L", "XL"],
        collectionId,
        descripcion: `Prenda ${tag} de la colección Topitop ${collectionId}. Confeccionada con materiales de alta calidad y acabados premium.`,
        galeriaImagenes: [urlImagen]
      });
      changed = true;
    }
  });

  if (changed) saveCatalog(catalog);
}

/**
 * Wires click-to-navigate on any grid containing static product cards.
 */
function setupStaticCardNavigation() {
  const grids = document.querySelectorAll('.products-grid-catalog, .products-grid, .catalog-grid');
  const detailUrl = getDetailPagePrefix();

  grids.forEach(grid => {
    if (grid.dataset.hasStaticNavListener) return;

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card-custom');
      const isFavBtn = e.target.closest('.fav-btn');
      if (card && !isFavBtn) {
        const productId = card.dataset.productId;
        if (productId) {
          window.location.href = `${detailUrl}?id=${productId}`;
        }
      }
    });

    grid.dataset.hasStaticNavListener = 'true';
  });
}

/**
 * Initializes the bridge. Safe to call on every page (idempotent, no-ops if nothing to do).
 */
export function initStaticCatalogBridge() {
  registerStaticCards();
  setupStaticCardNavigation();
}
