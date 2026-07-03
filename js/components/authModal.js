/**
 * AuthModal Component
 * Handles dynamic injection of the Login/Register modal,
 * tab switching, password visibility toggling, and form submissions.
 */

const SELECTORS = {
  authModalId: 'auth-modal',
  authModalOverlayId: 'auth-modal-overlay',
  authModalCloseId: 'auth-modal-close',
  userIconButtonClass: '.header-actions .fa-user',
  tabButtons: '.auth-tab',
  forms: '.auth-form',
  togglePasswordButtons: '.auth-toggle-pwd',
  loginFormId: 'login-form',
  registerFormId: 'register-form',
  loginEmailInputId: 'login-email',
  registerNameInputId: 'register-name'
};

const CLASSES = {
  open: 'open',
  active: 'active',
  iconEye: 'fa-regular fa-eye',
  iconEyeSlash: 'fa-regular fa-eye-slash'
};

const TAB_DATA_ATTR = 'tab';
const KEY_ESCAPE = 'Escape';

// Plantilla HTML del modal de autenticación (Login / Registro)
const AUTH_MODAL_HTML = `
<div class="auth-modal" id="${SELECTORS.authModalId}">
  <div class="auth-modal-overlay" id="${SELECTORS.authModalOverlayId}"></div>
  <div class="auth-modal-container">
    <div class="auth-modal-header">
      <span class="auth-modal-logo">Topitop</span>
      <button class="auth-modal-close" id="${SELECTORS.authModalCloseId}" aria-label="Cerrar modal">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="auth-modal-content">
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">Iniciar Sesión</button>
        <button class="auth-tab" data-tab="register">Registrarse</button>
      </div>

      <!-- Login Form -->
      <form class="auth-form active" id="login-form">
        <h3 class="auth-form-title">¡Hola! Ingresa tu correo y contraseña</h3>
        
        <div class="auth-input-group">
          <label for="login-email">Correo electrónico</label>
          <div class="auth-input-wrapper">
            <i class="fa-regular fa-envelope input-icon"></i>
            <input type="email" id="login-email" placeholder="ejemplo@correo.com" required>
          </div>
        </div>

        <div class="auth-input-group">
          <div class="auth-label-row">
            <label for="login-password">Contraseña</label>
            <a href="#" class="auth-forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
          <div class="auth-input-wrapper">
            <i class="fa-solid fa-lock input-icon"></i>
            <input type="password" id="login-password" placeholder="Tu contraseña" required>
            <button type="button" class="auth-toggle-pwd" aria-label="Mostrar contraseña">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="auth-options-row">
          <label class="auth-checkbox-label">
            <input type="checkbox" id="login-remember">
            <span>Recordarme en este dispositivo</span>
          </label>
        </div>

        <button type="submit" class="btn-auth-submit">Ingresar</button>

        <div class="auth-divider">
          <span>O ingresar con</span>
        </div>

        <div class="auth-social-buttons">
          <button type="button" class="btn-auth-social google">
            <i class="fa-brands fa-google"></i> Google
          </button>
          <button type="button" class="btn-auth-social facebook">
            <i class="fa-brands fa-facebook-f"></i> Facebook
          </button>
        </div>
      </form>

      <!-- Register Form -->
      <form class="auth-form" id="register-form">
        <h3 class="auth-form-title">Crea tu cuenta Topitop</h3>

        <div class="auth-input-group">
          <label for="register-name">Nombre completo</label>
          <div class="auth-input-wrapper">
            <i class="fa-regular fa-user input-icon"></i>
            <input type="text" id="register-name" placeholder="Tu nombre y apellido" required>
          </div>
        </div>
        
        <div class="auth-input-group">
          <label for="register-email">Correo electrónico</label>
          <div class="auth-input-wrapper">
            <i class="fa-regular fa-envelope input-icon"></i>
            <input type="email" id="register-email" placeholder="ejemplo@correo.com" required>
          </div>
        </div>

        <div class="auth-input-group">
          <label for="register-password">Contraseña</label>
          <div class="auth-input-wrapper">
            <i class="fa-solid fa-lock input-icon"></i>
            <input type="password" id="register-password" placeholder="Mínimo 8 caracteres" required>
            <button type="button" class="auth-toggle-pwd" aria-label="Mostrar contraseña">
              <i class="fa-regular fa-eye"></i>
            </button>
          </div>
        </div>

        <div class="auth-options-row">
          <label class="auth-checkbox-label">
            <input type="checkbox" id="register-terms" required>
            <span>Acepto los <a href="#" class="auth-terms-link">Términos y condiciones</a> y las <a href="#" class="auth-terms-link">Políticas de Privacidad</a></span>
          </label>
        </div>

        <button type="submit" class="btn-auth-submit">Registrarse</button>

        <div class="auth-divider">
          <span>O registrarse con</span>
        </div>

        <div class="auth-social-buttons">
          <button type="button" class="btn-auth-social google">
            <i class="fa-brands fa-google"></i> Google
          </button>
          <button type="button" class="btn-auth-social facebook">
            <i class="fa-brands fa-facebook-f"></i> Facebook
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
`;

/**
 * Controla la visibilidad de los inputs de contraseña.
 * @param {HTMLElement} passwordToggleBtn 
 */
function handlePasswordVisibilityToggle(passwordToggleBtn) {
  const passwordInput = passwordToggleBtn.previousElementSibling;
  const iconElement = passwordToggleBtn.querySelector('i');
  
  if (!passwordInput || !iconElement) return;

  const isPasswordHidden = passwordInput.type === 'password';
  
  passwordInput.type = isPasswordHidden ? 'text' : 'password';
  iconElement.className = isPasswordHidden ? CLASSES.iconEyeSlash : CLASSES.iconEye;
}

/**
 * Cambia la pestaña activa del formulario de autenticación.
 * @param {HTMLElement} selectedTabButton 
 * @param {NodeList} tabButtons 
 * @param {NodeList} forms 
 */
function switchAuthTab(selectedTabButton, tabButtons, forms) {
  const targetFormId = `${selectedTabButton.dataset[TAB_DATA_ATTR]}-form`;

  tabButtons.forEach(button => button.classList.remove(CLASSES.active));
  selectedTabButton.classList.add(CLASSES.active);

  forms.forEach(form => {
    const isTargetForm = form.id === targetFormId;
    form.classList.toggle(CLASSES.active, isTargetForm);
  });
}

/**
 * Agrega oyentes para alternar la visibilidad de las contraseñas.
 * @param {HTMLElement} modalElement 
 */
function setupPasswordToggles(modalElement) {
  const togglePasswordBtns = modalElement.querySelectorAll(SELECTORS.togglePasswordButtons);
  
  togglePasswordBtns.forEach(button => {
    button.addEventListener('click', () => handlePasswordVisibilityToggle(button));
  });
}

/**
 * Agrega oyentes de cambio de pestañas (Tabs).
 * @param {HTMLElement} modalElement 
 */
function setupTabSwitching(modalElement) {
  const tabButtons = modalElement.querySelectorAll(SELECTORS.tabButtons);
  const forms = modalElement.querySelectorAll(SELECTORS.forms);

  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchAuthTab(button, tabButtons, forms));
  });
}

/**
 * Configura los eventos de envío de formulario (Simulado).
 * @param {HTMLElement} modalElement 
 * @param {Function} closeCallback 
 */
function setupFormSubmissions(modalElement, closeCallback) {
  const loginForm = modalElement.querySelector(`#${SELECTORS.loginFormId}`);
  const registerForm = modalElement.querySelector(`#${SELECTORS.registerFormId}`);

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const userEmail = document.getElementById(SELECTORS.loginEmailInputId).value;
      alert(`¡Bienvenido de nuevo a Topitop, ${userEmail}!`);
      closeCallback();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const userName = document.getElementById(SELECTORS.registerNameInputId).value;
      alert(`¡Registro exitoso! Bienvenido ${userName} a la experiencia Topitop.`);
      closeCallback();
    });
  }
}

/**
 * Configura todos los eventos interactivos del modal.
 * @param {HTMLElement} modalElement 
 * @param {Function} closeCallback 
 */
function setupModalInteraction(modalElement, closeCallback) {
  const overlay = modalElement.querySelector(`#${SELECTORS.authModalOverlayId}`);
  const closeButton = modalElement.querySelector(`#${SELECTORS.authModalCloseId}`);

  if (closeButton) closeButton.addEventListener('click', closeCallback);
  if (overlay) overlay.addEventListener('click', closeCallback);

  // Cierra modal con la tecla Escape
  document.addEventListener('keydown', (event) => {
    const isEscapePressed = event.key === KEY_ESCAPE;
    const isModalVisible = modalElement.classList.contains(CLASSES.open);
    
    if (isEscapePressed && isModalVisible) {
      closeCallback();
    }
  });

  setupPasswordToggles(modalElement);
  setupTabSwitching(modalElement);
  setupFormSubmissions(modalElement, closeCallback);
}

/**
 * Inyecta el modal en el DOM si no existe previamente y configura sus eventos.
 * @returns {HTMLElement} El elemento modal inyectado
 */
function injectAuthModal() {
  let modalElement = document.getElementById(SELECTORS.authModalId);
  
  if (!modalElement) {
    document.body.insertAdjacentHTML('beforeend', AUTH_MODAL_HTML);
    modalElement = document.getElementById(SELECTORS.authModalId);

    const closeAuthModal = () => {
      modalElement.classList.remove(CLASSES.open);
      // Restaurar el comportamiento de scroll de la página de fondo
      document.body.style.overflow = '';
    };

    setupModalInteraction(modalElement, closeAuthModal);
  }

  return modalElement;
}

/**
 * Inicializa el enlace que abre el Modal de Autenticación.
 */
export function initAuthModal() {
  const userIcon = document.querySelector(SELECTORS.userIconButtonClass);
  if (!userIcon) return;

  const userButton = userIcon.closest('a');
  if (!userButton) return;

  userButton.addEventListener('click', (event) => {
    // Previene la navegación al '#' por defecto
    event.preventDefault();
    
    const modalElement = injectAuthModal();
    modalElement.classList.add(CLASSES.open);
    
    // Evita el scroll de la página de fondo al abrir el modal (Mejora UX)
    document.body.style.overflow = 'hidden';
  });
}
