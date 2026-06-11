import CollectionRepository from '../../src/repositories/CollectionRepository.js';
import CategoryRepository from '../../src/repositories/CategoryRepository.js';
import { categoryObserver } from '../../src/utils/CategoryChangeObserver.js';

/**
 * Navigation Component
 * Handles dynamic navbar rendering from repositories, mobile hamburger menu toggle, 
 * mobile accordion dropdowns, and category change observations.
 */

const SELECTORS = {
  hamburgerButtonId: 'hamburger-btn',
  hamburgerIconId: 'hamburger-icon',
  navigationContainerId: 'nav-links',
  navContainerClass: '.nav-item-container',
  navItemClass: '.nav-item',
  dropdownLinkClass: '.dropdown-list a'
};

const CLASSES = {
  menuOpen: 'open',
  accordionActive: 'active-mobile',
  iconBars: 'fa-solid fa-bars',
  iconClose: 'fa-solid fa-xmark'
};

const MOBILE_BREAKPOINT_PX = 768;

/**
 * Genera la URL de la página de categoría de forma dinámica y robusta.
 * Resuelve de manera root-relative (independiente de la profundidad del directorio)
 * detectando si el proyecto corre bajo un subdirectorio como /AGTopitop/ o en la raíz.
 */
function getCategoryPageUrl(collectionId, categorySlug) {
  const pathname = window.location.pathname;
  const pagesIdx = pathname.toLowerCase().indexOf('/pages');
  let base = '';

  if (pagesIdx !== -1) {
    base = pathname.substring(0, pagesIdx);
  } else {
    const lastSlash = pathname.lastIndexOf('/');
    base = pathname.substring(0, lastSlash);
  }

  // Elimina la barra diagonal final para evitar doble barra en la ruta resultante
  if (base === '/') {
    base = '';
  }

  return `${base}/Pages/category.html?collection=${collectionId}&category=${categorySlug}`;
}

/**
 * Renderiza dinámicamente las categorías del navbar obtenidas de los repositorios
 */
async function renderNavbar() {
  const container = document.getElementById(SELECTORS.navigationContainerId);
  if (!container) return;

  try {
    const collections = await CollectionRepository.findAll();
    const activeCollections = collections.filter(c => c.activo);
    
    let html = '';

    for (const col of activeCollections) {
      const categories = await CategoryRepository.findByCollection(col.id);
      const activeCategories = categories.filter(cat => cat.activo);

      // Limpiar el nombre de la colección para mostrar (ej: HombreTop -> Hombre)
      const displayName = col.nombre.replace('Top', '');

      html += `
        <div class="nav-item-container">
          <a href="#" class="nav-item"><span>${displayName}<strong>Top</strong></span> <i class="fa-solid fa-chevron-down nav-icon"></i></a>
          <div class="dropdown-menu">
            <div class="dropdown-header">Colección ${col.nombre}</div>
            <ul class="dropdown-list">
              ${activeCategories.map(cat => `
                <li><a href="${getCategoryPageUrl(col.id, cat.slug)}">${cat.nombre}</a></li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    console.error('Error al renderizar el navbar dinámico:', err);
  }
}

function resetMobileDropdowns(navContainers) {
  navContainers.forEach(container => {
    container.classList.remove(CLASSES.accordionActive);
  });
}

function updateHamburgerIcon(hamburgerIcon, isMenuOpen) {
  hamburgerIcon.className = isMenuOpen ? CLASSES.iconClose : CLASSES.iconBars;
}

function setupHamburgerClick(hamburgerButton, hamburgerIcon, navigationContainer, navContainers) {
  hamburgerButton.addEventListener('click', () => {
    const isMenuOpen = navigationContainer.classList.toggle(CLASSES.menuOpen);
    updateHamburgerIcon(hamburgerIcon, isMenuOpen);

    if (!isMenuOpen) {
      resetMobileDropdowns(navContainers);
    }
  });
}

function setupAccordionItem(container, navContainers) {
  const triggerButton = container.querySelector(SELECTORS.navItemClass);
  if (!triggerButton) return;

  // Remover event listener previo si existiera (limpieza)
  const newTrigger = triggerButton.cloneNode(true);
  triggerButton.parentNode.replaceChild(newTrigger, triggerButton);

  newTrigger.addEventListener('click', (event) => {
    const isMobileView = window.innerWidth <= MOBILE_BREAKPOINT_PX;
    if (isMobileView) {
      event.preventDefault();
      const isAlreadyActive = container.classList.contains(CLASSES.accordionActive);
      resetMobileDropdowns(navContainers);

      if (!isAlreadyActive) {
        container.classList.add(CLASSES.accordionActive);
      }
    }
  });
}

function setupSubItemLinks(navigationContainer, hamburgerIcon, navContainers) {
  const dropdownLinks = navigationContainer.querySelectorAll(SELECTORS.dropdownLinkClass);
  
  dropdownLinks.forEach(link => {
    link.addEventListener('click', () => {
      navigationContainer.classList.remove(CLASSES.menuOpen);
      updateHamburgerIcon(hamburgerIcon, false);
      resetMobileDropdowns(navContainers);
    });
  });
}

/**
 * Inicializa toda la funcionalidad de navegación del navbar.
 */
export async function initMobileNavigation() {
  // 1. Renderizado dinámico asíncrono
  await renderNavbar();

  const hamburgerButton = document.getElementById(SELECTORS.hamburgerButtonId);
  const hamburgerIcon = document.getElementById(SELECTORS.hamburgerIconId);
  const navigationContainer = document.getElementById(SELECTORS.navigationContainerId);

  const hasRequiredElements = hamburgerButton && hamburgerIcon && navigationContainer;
  if (!hasRequiredElements) return;

  const navContainers = navigationContainer.querySelectorAll(SELECTORS.navContainerClass);

  // 2. Setup listeners
  setupHamburgerClick(hamburgerButton, hamburgerIcon, navigationContainer, navContainers);
  
  navContainers.forEach(container => {
    setupAccordionItem(container, navContainers);
  });

  setupSubItemLinks(navigationContainer, hamburgerIcon, navContainers);

  // 3. Suscribirse al Observer para actualizar en tiempo real
  categoryObserver.subscribe('category_change', async () => {
    await renderNavbar();
    const updatedContainers = navigationContainer.querySelectorAll(SELECTORS.navContainerClass);
    updatedContainers.forEach(container => {
      setupAccordionItem(container, updatedContainers);
    });
    setupSubItemLinks(navigationContainer, hamburgerIcon, updatedContainers);
  });
}
