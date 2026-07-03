import AdminAuthController from '../controllers/AdminAuthController.js';

/**
 * UTILS layer - Navigation guard for protected admin pages.
 * Clean Code: Runs instantly on load, SRP (only handles redirection).
 */

const authController = new AdminAuthController();

// Comentario del PORQUÉ: Bloqueamos inmediatamente el renderizado si no hay sesión
// para evitar que el usuario vea componentes del dashboard por una fracción de segundo.
if (!authController.isAuthenticated()) {
  const loginPageUrl = './login.html';
  window.location.replace(loginPageUrl);
}
