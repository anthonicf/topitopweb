/**
 * Application Entrypoint
 * Coordinates and initializes modular components when the DOM is ready.
 * Implements SRP (Single Responsibility Principle) at the application level.
 */

import { initMobileNavigation } from './components/navigation.js';
import { initCarousels } from './components/carousel.js';
import { initAuthModal } from './components/authModal.js';
import { initFavorites } from './components/favorites.js';
import { initCart } from './components/cart.js';
import { initStaticCatalogBridge } from './components/staticCatalogBridge.js';
import { initFooterAcordeon } from './components/footerAcordeon.js';
import { initFaqAcordeon } from './components/faqAcordeon.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initCarousels();
  initAuthModal();
  initStaticCatalogBridge();
  initFavorites();
  initCart();
  initFooterAcordeon();
  initFaqAcordeon();
});
