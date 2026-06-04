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
});
