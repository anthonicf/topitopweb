/**
 * Favorites (Me Encanta) Component
 * Handles adding/removing products from favorites, syncs with LocalStorage,
 * manages the sliding drawer UI, and updates navbar badges.
 */

// Local Storage Key
const STORAGE_KEY = 'topitop_favorites';

/**
 * Helper to slugify product names for unique identifiers
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
  // Remove parent folder prefixes to get root-relative image source
  return imgSrc.replace(/^(\.\.\/)+/, '');
}

/**
 * Returns current favorites from LocalStorage
 */
export function getFavorites() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Injects drawer and overlay markup if not already present
 */
function injectDrawerHTML() {
  if (document.getElementById('fav-drawer-container')) return;

  const container = document.createElement('div');
  container.id = 'fav-drawer-container';
  container.innerHTML = `
    <div class="fav-drawer-overlay" id="fav-drawer-overlay"></div>
    <div class="fav-drawer" id="fav-drawer">
      <div class="fav-drawer-header">
        <h3>Mis Favoritos</h3>
        <button class="fav-drawer-close" id="fav-drawer-close" aria-label="Cerrar favoritos">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="fav-drawer-content" id="fav-drawer-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Bind close events
  document.getElementById('fav-drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('fav-drawer-overlay').addEventListener('click', closeDrawer);
}

/**
 * Opens the sliding Favorites drawer
 */
export function openDrawer() {
  injectDrawerHTML();
  renderFavoritesList();
  
  // Force reflow
  const drawer = document.getElementById('fav-drawer');
  const overlay = document.getElementById('fav-drawer-overlay');
  
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
  }
}

/**
 * Closes the sliding Favorites drawer
 */
export function closeDrawer() {
  const drawer = document.getElementById('fav-drawer');
  const overlay = document.getElementById('fav-drawer-overlay');
  
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

/**
 * Populates the list inside the Favorites Drawer
 */
function renderFavoritesList() {
  const content = document.getElementById('fav-drawer-content');
  if (!content) return;

  const favorites = getFavorites();

  if (favorites.length === 0) {
    content.innerHTML = `
      <div class="fav-empty-state">
        <i class="fa-regular fa-heart"></i>
        <p>Tu lista de favoritos está vacía.</p>
        <span style="font-size:0.82rem;color:#999;max-width:240px;line-height:1.4;">¡Agrega las prendas que más te gusten haciendo clic en el corazón!</span>
      </div>
    `;
    return;
  }

  const rootPrefix = getRootPrefix();
  let html = '';

  favorites.forEach(item => {
    const cleanImg = item.urlImagen;
    const finalImgSrc = (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('data:'))
      ? cleanImg
      : `${rootPrefix}${cleanImg}`;

    html += `
      <div class="fav-item" data-id="${item.id}">
        <a href="${item.link}" style="display:flex; gap:1rem; flex:1; align-items:center; text-decoration:none;">
          <img src="${finalImgSrc}" alt="${item.nombre}" class="fav-item-img">
          <div class="fav-item-details">
            <span class="fav-item-tag">${item.tag}</span>
            <h4 class="fav-item-title">${item.nombre}</h4>
            <span class="fav-item-price">${item.precio}</span>
          </div>
        </a>
        <button class="fav-item-remove" aria-label="Eliminar de favoritos" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  });

  content.innerHTML = html;

  // Setup click listeners for trash buttons inside the drawer
  content.querySelectorAll('.fav-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      removeFavoriteById(id);
    });
  });
}

/**
 * Removes favorite by ID (called from drawer list)
 */
function removeFavoriteById(id) {
  let favorites = getFavorites();
  favorites = favorites.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));

  updateNavbarBadge();
  renderFavoritesList();
  updateFavoriteStates();
}

/**
 * Extracts normalized product details from a product card DOM element
 */
function extractProductFromCard(card) {
  let nombre = '';
  let urlImagen = '';
  let precio = '';
  let tag = 'Moda Premium';

  if (card.classList.contains('product-card-custom')) {
    nombre = card.querySelector('.card-title')?.textContent.trim() || '';
    urlImagen = card.querySelector('.card-img-wrap img')?.getAttribute('src') || '';
    precio = card.querySelector('.price-current')?.textContent.trim() || '';
    tag = card.querySelector('.card-tag')?.textContent.trim() || 'Moda Premium';
  } else if (card.classList.contains('product-item')) {
    nombre = card.querySelector('.cursive-name')?.textContent.trim() || '';
    urlImagen = card.querySelector('.product-image-container img')?.getAttribute('src') || '';
    precio = card.querySelector('.product-price')?.textContent.trim() || '';
    tag = card.querySelector('.product-model')?.textContent.trim() || 'Moda Premium';
  }

  if (!nombre) return null;

  return {
    id: slugify(nombre),
    nombre,
    urlImagen: getAbsoluteOrRootRelativeImg(urlImagen),
    precio,
    tag,
    link: window.location.href
  };
}

/**
 * Updates favorite buttons visual active states across the page
 */
export function updateFavoriteStates() {
  const favorites = getFavorites();
  const buttons = document.querySelectorAll('.fav-btn');

  buttons.forEach(btn => {
    const card = btn.closest('.product-card-custom') || btn.closest('.product-item');
    if (!card) return;

    const product = extractProductFromCard(card);
    if (!product) return;

    const isFav = favorites.some(item => item.id === product.id);
    const icon = btn.querySelector('i');

    if (isFav) {
      btn.classList.add('active');
      if (icon) {
        icon.className = 'fa-solid fa-heart';
      }
    } else {
      btn.classList.remove('active');
      if (icon) {
        icon.className = 'fa-regular fa-heart';
      }
    }
  });
}

/**
 * Updates count badge on navigation bar
 */
export function updateNavbarBadge() {
  const count = getFavorites().length;
  const badges = document.querySelectorAll('.fav-badge');
  
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
 * Handles clicking a fav button on the grid
 */
function handleFavBtnClick(btn) {
  const card = btn.closest('.product-card-custom') || btn.closest('.product-item');
  if (!card) return;

  const product = extractProductFromCard(card);
  if (!product) return;

  let favorites = getFavorites();
  const index = favorites.findIndex(item => item.id === product.id);

  if (index === -1) {
    // Add to favorites
    favorites.push(product);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    btn.classList.add('active');
    const icon = btn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-heart';
  } else {
    // Remove from favorites
    favorites.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    btn.classList.remove('active');
    const icon = btn.querySelector('i');
    if (icon) icon.className = 'fa-regular fa-heart';
  }

  updateNavbarBadge();
  
  // If drawer is open, re-render it
  const drawer = document.getElementById('fav-drawer');
  if (drawer && drawer.classList.contains('open')) {
    renderFavoritesList();
  }
}

/**
 * Dynamic event bindings for navigation links
 */
function setupNavbarTriggers() {
  // Select all heart icons in headers across pages
  const heartIcons = document.querySelectorAll('.header-actions a i.fa-heart, .header-actions a i.fa-solid.fa-heart');
  
  heartIcons.forEach(icon => {
    const link = icon.closest('a');
    if (!link) return;

    // Prevent navigation and bind to open drawer
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openDrawer();
    });

    // Dynamically insert badge if missing
    if (!link.querySelector('.fav-badge')) {
      const badge = document.createElement('span');
      badge.className = 'fav-badge';
      badge.textContent = '0';
      link.appendChild(badge);
    }
  });

  updateNavbarBadge();
}

/**
 * Initializes favorites system
 */
export function initFavorites() {
  injectDrawerHTML();
  setupNavbarTriggers();
  updateFavoriteStates();

  // Use Event Delegation to capture clicks on .fav-btn elements globally
  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleFavBtnClick(favBtn);
    }
  });
}
