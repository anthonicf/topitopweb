/**
 * Navigation Component
 * Handles mobile hamburger menu toggle, mobile accordion dropdowns,
 * and navigation interaction.
 */

// Constantes globales del módulo para evitar selectores repetidos
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
 * Remueve la clase activa de todos los contenedores de acordeón móviles.
 * @param {NodeList} navContainers 
 */
function resetMobileDropdowns(navContainers) {
  navContainers.forEach(container => {
    container.classList.remove(CLASSES.accordionActive);
  });
}

/**
 * Cambia el estado visual del ícono de menú hamburguesa.
 * @param {HTMLElement} hamburgerIcon 
 * @param {boolean} isMenuOpen 
 */
function updateHamburgerIcon(hamburgerIcon, isMenuOpen) {
  hamburgerIcon.className = isMenuOpen ? CLASSES.iconClose : CLASSES.iconBars;
}

/**
 * Configura la acción al hacer clic en el botón de menú hamburguesa.
 * @param {HTMLElement} hamburgerButton 
 * @param {HTMLElement} hamburgerIcon 
 * @param {HTMLElement} navigationContainer 
 * @param {NodeList} navContainers 
 */
function setupHamburgerClick(hamburgerButton, hamburgerIcon, navigationContainer, navContainers) {
  hamburgerButton.addEventListener('click', () => {
    const isMenuOpen = navigationContainer.classList.toggle(CLASSES.menuOpen);
    updateHamburgerIcon(hamburgerIcon, isMenuOpen);

    if (!isMenuOpen) {
      resetMobileDropdowns(navContainers);
    }
  });
}

/**
 * Inicializa la lógica de acordeón para un ítem de navegación individual en móvil.
 * @param {HTMLElement} container 
 * @param {NodeList} navContainers 
 */
function setupAccordionItem(container, navContainers) {
  const triggerButton = container.querySelector(SELECTORS.navItemClass);
  if (!triggerButton) return;

  triggerButton.addEventListener('click', (event) => {
    const isMobileView = window.innerWidth <= MOBILE_BREAKPOINT_PX;
    if (isMobileView) {
      // Evitamos el comportamiento de redirección por defecto del enlace 
      // para permitir que el acordeón se despliegue en móvil.
      event.preventDefault();

      const isAlreadyActive = container.classList.contains(CLASSES.accordionActive);

      resetMobileDropdowns(navContainers);

      if (!isAlreadyActive) {
        container.classList.add(CLASSES.accordionActive);
      }
    }
  });
}

/**
 * Configura el cierre automático del menú al presionar un enlace de categoría.
 * @param {HTMLElement} navigationContainer 
 * @param {HTMLElement} hamburgerIcon 
 * @param {NodeList} navContainers 
 */
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
 * Inicializa toda la funcionalidad de navegación móvil.
 * Cumple con SRP al delegar tareas específicas a funciones auxiliares de menos de 20 líneas.
 */
export function initMobileNavigation() {
  const hamburgerButton = document.getElementById(SELECTORS.hamburgerButtonId);
  const hamburgerIcon = document.getElementById(SELECTORS.hamburgerIconId);
  const navigationContainer = document.getElementById(SELECTORS.navigationContainerId);

  const hasRequiredElements = hamburgerButton && hamburgerIcon && navigationContainer;
  if (!hasRequiredElements) return;

  const navContainers = navigationContainer.querySelectorAll(SELECTORS.navContainerClass);

  setupHamburgerClick(hamburgerButton, hamburgerIcon, navigationContainer, navContainers);
  
  navContainers.forEach(container => {
    setupAccordionItem(container, navContainers);
  });

  setupSubItemLinks(navigationContainer, hamburgerIcon, navContainers);
}
