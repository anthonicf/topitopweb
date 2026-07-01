const BREAKPOINT = 768;

export function initFaqAcordeon() {
    const encabezados = document.querySelectorAll('.pregunta-encabezado');
    if (!encabezados.length) return;

    encabezados.forEach(encabezado => {
        encabezado.addEventListener('click', () => {
            if (window.innerWidth > BREAKPOINT) return;
            const item = encabezado.closest('.item-pregunta');
            item.classList.toggle('pregunta-abierta');
        });
    });
}
