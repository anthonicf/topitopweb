/**
 * JavaScript for Topitop Landing Page
 * Handles main slider carousel auto-play and manual navigation.
 * Handles drag-to-scroll for the secondary carousel.
 * Handles hamburger menu for mobile.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- MENÚ HAMBURGUESA Y DESPLEGABLES (MÓVIL) ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerBtn && navLinks) {
        const navContainers = navLinks.querySelectorAll('.nav-item-container');

        // Reset accordion dropdown states
        const resetMobileDropdowns = () => {
            navContainers.forEach(container => {
                container.classList.remove('active-mobile');
            });
        };

        hamburgerBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            // Cambiar ícono entre ☰ y ✕
            hamburgerIcon.className = isOpen
                ? 'fa-solid fa-xmark'
                : 'fa-solid fa-bars';

            if (!isOpen) {
                resetMobileDropdowns();
            }
        });

        // Toggle mobile accordion dropdowns
        navContainers.forEach(container => {
            const trigger = container.querySelector('.nav-item');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    // Only apply accordion toggle in mobile view (width <= 768px)
                    if (window.innerWidth <= 768) {
                        e.preventDefault(); // Prevent navigating or hash jumps

                        const isActive = container.classList.contains('active-mobile');

                        // Close all accordions first
                        resetMobileDropdowns();

                        // If it wasn't active, toggle it active
                        if (!isActive) {
                            container.classList.add('active-mobile');
                        }
                    }
                });
            }
        });

        // Cerrar el menú al hacer clic en un enlace de las categorías (sub-ítems)
        navLinks.querySelectorAll('.dropdown-list a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburgerIcon.className = 'fa-solid fa-bars';
                resetMobileDropdowns();
            });
        });
    }


    const slides = document.querySelectorAll('.slide');
    const btnPrev = document.getElementById('prev-main');
    const btnNext = document.getElementById('next-main');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds
    let sliderTimer;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    function resetTimer() {
        clearInterval(sliderTimer);
        sliderTimer = setInterval(nextSlide, slideInterval);
    }

    // Event Listeners for Slider Buttons
    if (btnNext && btnPrev) {
        btnNext.addEventListener('click', () => {
            nextSlide();
            resetTimer();
        });

        btnPrev.addEventListener('click', () => {
            prevSlide();
            resetTimer();
        });
    }

    // Initialize auto-play
    sliderTimer = setInterval(nextSlide, slideInterval);


    // --- SECONDARY CAROUSEL (DRAG TO SCROLL) ---
    const carouselContainer = document.querySelector('.carousel-container');

    if (carouselContainer) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carouselContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            carouselContainer.style.cursor = 'grabbing';
            startX = e.pageX - carouselContainer.offsetLeft;
            scrollLeft = carouselContainer.scrollLeft;
        });

        carouselContainer.addEventListener('mouseleave', () => {
            isDown = false;
            carouselContainer.style.cursor = 'w-resize'; // Default cursor for draggable area
        });

        carouselContainer.addEventListener('mouseup', () => {
            isDown = false;
            carouselContainer.style.cursor = 'w-resize';
        });

        carouselContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carouselContainer.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast multiplier
            carouselContainer.scrollLeft = scrollLeft - walk;
        });

        // Setup initial cursor
        carouselContainer.style.cursor = 'w-resize';
    }

    // --- AUTH MODAL (LOGIN / REGISTER) ---
    const injectAuthModal = () => {
        if (document.getElementById('auth-modal')) return;

        const modalHtml = `
<div class="auth-modal" id="auth-modal">
  <div class="auth-modal-overlay" id="auth-modal-overlay"></div>
  <div class="auth-modal-container">
    <button class="auth-modal-close" id="auth-modal-close" aria-label="Cerrar modal">
      <i class="fa-solid fa-xmark"></i>
    </button>
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
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        setupModalEvents();
    };

    const setupModalEvents = () => {
        const modal = document.getElementById('auth-modal');
        const overlay = document.getElementById('auth-modal-overlay');
        const closeBtn = document.getElementById('auth-modal-close');
        const tabs = modal.querySelectorAll('.auth-tab');
        const forms = modal.querySelectorAll('.auth-form');
        const togglePwdBtns = modal.querySelectorAll('.auth-toggle-pwd');

        // Close functions
        const closeModal = () => {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                forms.forEach(form => {
                    if (form.id === `${targetTab}-form`) {
                        form.classList.add('active');
                    } else {
                        form.classList.remove('active');
                    }
                });
            });
        });

        // Password visibility toggle
        togglePwdBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                const icon = btn.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fa-regular fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fa-regular fa-eye';
                }
            });
        });

        // Form submission (simulated for clean UI feedback)
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            alert(`¡Bienvenido de nuevo a Topitop, ${email}!`);
            closeModal();
        });

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            alert(`¡Registro exitoso! Bienvenido ${name} a la experiencia Topitop.`);
            closeModal();
        });
    };

    // Bind click to open auth modal
    const userIcon = document.querySelector('.header-actions .fa-user');
    if (userIcon) {
        const userBtn = userIcon.closest('a');
        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.preventDefault();
                injectAuthModal();
                const modal = document.getElementById('auth-modal');
                modal.classList.add('open');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        }
    }
});
