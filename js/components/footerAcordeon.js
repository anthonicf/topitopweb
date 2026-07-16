const BREAKPOINT = 768;

export function initFooterAcordeon() {
    const encabezados = document.querySelectorAll('.encabezado-acordeon-footer');
    if (!encabezados.length) return;

    encabezados.forEach(encabezado => {
        encabezado.addEventListener('click', () => {
            if (window.innerWidth > BREAKPOINT) return;
            const col = encabezado.closest('.footer-col');
            const estaAbierto = col.classList.contains('col-abierta');
            // Cierra todas
            document.querySelectorAll('.footer-col.col-abierta').forEach(c => c.classList.remove('col-abierta'));
            // Abre la clicada (si estaba cerrada)
            if (!estaAbierto) col.classList.add('col-abierta');
        });
    });
}
