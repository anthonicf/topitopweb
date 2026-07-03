/**
 * Carousel Component
 * Handles the Main Hero Slider (with auto-play and manual navigation)
 * and the Secondary Carousel (drag-to-scroll interaction).
 */

const SELECTORS = {
  slides: '.slide',
  buttonPrevMainId: 'prev-main',
  buttonNextMainId: 'next-main',
  carouselContainer: '.carousel-container'
};

const CLASSES = {
  slideActive: 'active'
};

const CONFIG = {
  slideIntervalMs: 5000,
  scrollFastMultiplier: 2
};

const CURSORS = {
  draggable: 'w-resize',
  dragging: 'grabbing'
};

/**
 * Inicializa la lógica del Slider principal de la cabecera.
 */
function initHeroSlider() {
  const slides = document.querySelectorAll(SELECTORS.slides);
  const buttonPrev = document.getElementById(SELECTORS.buttonPrevMainId);
  const buttonNext = document.getElementById(SELECTORS.buttonNextMainId);

  const hasRequiredElements = slides.length > 0;
  if (!hasRequiredElements) return;

  let currentSlideIndex = 0;
  let sliderTimerId = null;

  const showSlide = (targetIndex) => {
    slides[currentSlideIndex].classList.remove(CLASSES.slideActive);
    currentSlideIndex = (targetIndex + slides.length) % slides.length;
    slides[currentSlideIndex].classList.add(CLASSES.slideActive);
  };

  const showNextSlide = () => showSlide(currentSlideIndex + 1);
  const showPrevSlide = () => showSlide(currentSlideIndex - 1);

  const startAutoPlay = () => {
    sliderTimerId = setInterval(showNextSlide, CONFIG.slideIntervalMs);
  };

  const resetAutoPlayTimer = () => {
    clearInterval(sliderTimerId);
    startAutoPlay();
  };

  // Asigna eventos a los botones si existen en la página actual
  if (buttonNext && buttonPrev) {
    buttonNext.addEventListener('click', () => {
      showNextSlide();
      resetAutoPlayTimer();
    });

    buttonPrev.addEventListener('click', () => {
      showPrevSlide();
      resetAutoPlayTimer();
    });
  }

  // Comienza el auto-play inicial
  startAutoPlay();
}

/**
 * Configura los eventos del mouse para el efecto Drag-to-Scroll.
 * @param {HTMLElement} carouselContainer 
 */
function setupDragEvents(carouselContainer) {
  let isMousePressed = false;
  let startXPosition = 0;
  let initialScrollLeft = 0;

  carouselContainer.addEventListener('mousedown', (event) => {
    isMousePressed = true;
    carouselContainer.style.cursor = CURSORS.dragging;
    startXPosition = event.pageX - carouselContainer.offsetLeft;
    initialScrollLeft = carouselContainer.scrollLeft;
  });

  const stopDragging = () => {
    isMousePressed = false;
    carouselContainer.style.cursor = CURSORS.draggable;
  };

  carouselContainer.addEventListener('mouseleave', stopDragging);
  carouselContainer.addEventListener('mouseup', stopDragging);

  carouselContainer.addEventListener('mousemove', (event) => {
    if (!isMousePressed) return;
    
    // Evitamos la selección de texto o arrastre de imágenes nativo
    event.preventDefault();
    
    const currentXPosition = event.pageX - carouselContainer.offsetLeft;
    const walkDistance = (currentXPosition - startXPosition) * CONFIG.scrollFastMultiplier;
    carouselContainer.scrollLeft = initialScrollLeft - walkDistance;
  });

  // Establece el cursor por defecto inicial
  carouselContainer.style.cursor = CURSORS.draggable;
}

/**
 * Inicializa el carrusel secundario con soporte para arrastre horizontal.
 */
function initDragToScrollCarousel() {
  const carouselContainer = document.querySelector(SELECTORS.carouselContainer);
  if (!carouselContainer) return;

  setupDragEvents(carouselContainer);
}

/**
 * Coordinador de inicialización de todos los carruseles.
 */
export function initCarousels() {
  initHeroSlider();
  initDragToScrollCarousel();

  // Comentario del PORQUÉ: Exponemos la re-inicialización del carrusel para que el cargador asíncrono 
  // de la vista pública del home pueda re-enlazar los eventos drag-to-scroll al inyectar nuevos items.
  window.TopitopApp = window.TopitopApp || {};
  window.TopitopApp.reinitDragCarousel = initDragToScrollCarousel;
}
