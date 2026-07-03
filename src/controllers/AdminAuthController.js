const VALID_CREDENTIALS = {
  username: 'admin@topitop.pe',
  password: 'AdminTopitop2026'
};

const SESSION_KEY = 'topitop_admin_authenticated';
const SESSION_VALUE = 'session_active_token';

/**
 * CONTROLLER layer - Handles administrator authentication and session.
 * Clean Code: Clear flow control, no DOM manipulation, separation of keys.
 */
export default class AdminAuthController {
  /**
   * Simula el proceso de inicio de sesión con validación de credenciales.
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  async login(username, password) {
    // Simulación de delay de red para realismo
    await new Promise(resolve => setTimeout(resolve, 500));

    const isValidUsername = username === VALID_CREDENTIALS.username;
    const isValidPassword = password === VALID_CREDENTIALS.password;

    if (!isValidUsername || !isValidPassword) {
      throw new Error('Las credenciales ingresadas son incorrectas. Intente de nuevo.');
    }

    localStorage.setItem(SESSION_KEY, SESSION_VALUE);
    return true;
  }

  /**
   * Cierra la sesión activa del administrador.
   * @returns {Promise<void>}
   */
  async logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  /**
   * Verifica de manera síncrona si hay una sesión activa.
   * @returns {boolean}
   */
  isAuthenticated() {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    return sessionToken === SESSION_VALUE;
  }
}
