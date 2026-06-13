/**
 * Application Entrypoint
 * Coordinates and initializes modular components when the DOM is ready.
 * Implements SRP (Single Responsibility Principle) at the application level.
 */

import { initMobileNavigation } from './components/navigation.js';
import { initCarousels } from './components/carousel.js';
import { initAuthModal } from './components/authModal.js';
import { initFavorites } from './components/favorites.js';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initCarousels();
  initAuthModal();
  initFavorites();
});
