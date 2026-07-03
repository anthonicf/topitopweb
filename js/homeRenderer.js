import HomeSectionTopService from '../src/services/HomeSectionTopService.js';
import HomeSectionSearchService from '../src/services/HomeSectionSearchService.js';
import HomeSectionKidsService from '../src/services/HomeSectionKidsService.js';
import { updateFavoriteStates } from './components/favorites.js';

// VIEW layer - Public homepage renderer (coordinates static template population)
const CONTAINERS = {
  top: 'mas-top-container',
  search: 'mas-buscado-container',
  kids: 'kids-top-container'
};

const TEMPLATE_PATHS = {
  top: 'src/views/public/sectionTop.html',
  search: 'src/views/public/sectionSearch.html',
  kids: 'src/views/public/sectionKids.html'
};

document.addEventListener('DOMContentLoaded', () => {
  renderHomepageSections();
});

/**
 * Carga de manera asíncrona un archivo de plantilla.
 * @param {string} path 
 * @returns {Promise<string>}
 */
async function fetchTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Error al leer plantilla en ${path}`);
  }
  return await response.text();
}

/**
 * Renderiza de forma dinámica las 3 secciones editables del Home.
 */
async function renderHomepageSections() {
  try {
    await Promise.all([
      renderTopSection(),
      renderSearchSection(),
      renderKidsSection()
    ]);
  } catch (error) {
    // Comentario del PORQUÉ: Propagamos el error en consola para depurar fallos en la lectura de plantillas o localStorage.
    console.error(`Error de renderizado dinámico en Home: ${error.message}`);
  }
}

/**
 * Define los metadatos visuales de alineación y flechas SVG de la sección TOP
 * para conservar la estética original y premium de la tienda.
 */
function getTopItemVisualMeta(index) {
  const visualPatterns = [
    {
      alignClass: '',
      textAlignClass: '',
      pointerArrow: `<svg class="pointer-arrow" viewBox="0 0 50 50"><path d="M40 10 Q 30 40 10 40" stroke="#8B0000" fill="none" stroke-width="1.5" /><polygon points="10,40 15,35 15,45" fill="#8B0000" /></svg>`
    },
    {
      alignClass: 'left-side',
      textAlignClass: 'text-right',
      pointerArrow: `<svg class="pointer-arrow right-arrow" viewBox="0 0 50 50"><path d="M10 25 L 40 25" stroke="#8B0000" fill="none" stroke-width="1.5" /><polygon points="40,25 35,20 35,30" fill="#8B0000" /></svg>`
    },
    {
      alignClass: 'bottom-left',
      textAlignClass: 'text-right',
      pointerArrow: `<svg class="pointer-arrow right-arrow" viewBox="0 0 50 50"><path d="M10 25 L 40 25" stroke="#8B0000" fill="none" stroke-width="1.5" /><polygon points="40,25 35,20 35,30" fill="#8B0000" /></svg>`
    },
    {
      alignClass: 'left-side',
      textAlignClass: 'text-right',
      pointerArrow: `<svg class="pointer-arrow right-arrow" viewBox="0 0 50 50"><path d="M10 25 L 40 25" stroke="#8B0000" fill="none" stroke-width="1.5" /><polygon points="40,25 35,20 35,30" fill="#8B0000" /></svg>`
    },
    {
      alignClass: 'left-side top-arrow',
      textAlignClass: 'text-right',
      pointerArrow: `<svg class="pointer-arrow right-arrow arch" viewBox="0 0 50 50"><path d="M10 10 Q 30 10 40 40" stroke="#8B0000" fill="none" stroke-width="1.5" /><polygon points="40,40 35,35 45,35" fill="#8B0000" /></svg>`
    }
  ];

  // Aplicación cíclica para soportar más de 5 elementos sin romper la estética
  return visualPatterns[index % visualPatterns.length];
}

/**
 * Renderiza la sección "Lo más TOP".
 */
async function renderTopSection() {
  const container = document.getElementById(CONTAINERS.top);
  if (!container) return;

  try {
    const [template, items] = await Promise.all([
      fetchTemplate(TEMPLATE_PATHS.top),
      HomeSectionTopService.fetchAll()
    ]);

    const activeItems = items.filter(item => item.activo);
    let htmlResult = '';

    activeItems.forEach((item, index) => {
      const visualMeta = getTopItemVisualMeta(index);
      const discountHtml = item.descuento > 0 
        ? `<div class="discount-badge">-${item.descuento}%</div>` 
        : '';

      const colorVal = item.color ? item.color.toUpperCase() : 'ÚNICO';

      let itemHtml = template
        .replaceAll('{{id}}', item.id)
        .replaceAll('{{urlImagen}}', item.urlImagen)
        .replaceAll('{{nombre}}', item.nombre)
        .replaceAll('{{color}}', colorVal)
        .replaceAll('{{precio}}', item.precio.toFixed(2))
        .replaceAll('{{alignClass}}', visualMeta.alignClass)
        .replaceAll('{{textAlignClass}}', visualMeta.textAlignClass)
        .replaceAll('{{pointerArrow}}', visualMeta.pointerArrow)
        .replaceAll('{{discountBadge}}', discountHtml);

      htmlResult += itemHtml;
    });

    container.innerHTML = htmlResult;
    updateFavoriteStates();

    if (!container.dataset.hasDetailListener) {
      container.addEventListener('click', (e) => {
        const card = e.target.closest('.product-item');
        const isFavBtn = e.target.closest('.fav-btn');
        if (card && !isFavBtn) {
          const productId = card.dataset.productId;
          if (productId) {
            window.location.href = `producto-detalle/producto-detalle.html?id=${productId}`;
          }
        }
      });
      container.dataset.hasDetailListener = 'true';
    }
  } catch (err) {
    console.error('Error al renderizar productos destacados:', err);
  }
}

/**
 * Renderiza la sección "Lo más buscado".
 */
async function renderSearchSection() {
  const container = document.getElementById(CONTAINERS.search);
  if (!container) return;

  const [template, items] = await Promise.all([
    fetchTemplate(TEMPLATE_PATHS.search),
    HomeSectionSearchService.fetchAll()
  ]);

  const activeItems = items.filter(item => item.activo);
  let htmlResult = '';

  activeItems.forEach(item => {
    let itemHtml = template
      .replaceAll('{{urlImagen}}', item.urlImagen)
      .replaceAll('{{categoria}}', item.categoria)
      .replaceAll('{{subcategoria}}', item.subcategoria.toUpperCase());

    htmlResult += itemHtml;
  });

  container.innerHTML = htmlResult;

  // Comentario del PORQUÉ: Re-inicializamos el carrusel de arrastre para vincular los nuevos nodos inyectados.
  if (window.TopitopApp && window.TopitopApp.reinitDragCarousel) {
    window.TopitopApp.reinitDragCarousel();
  }
}

/**
 * Renderiza la sección de la galería "Kids TOP".
 */
async function renderKidsSection() {
  const container = document.getElementById(CONTAINERS.kids);
  if (!container) return;

  const [template, items] = await Promise.all([
    fetchTemplate(TEMPLATE_PATHS.kids),
    HomeSectionKidsService.fetchAll()
  ]);

  // Ordenamos de menor a mayor por la propiedad "orden"
  const sortedActiveItems = items
    .filter(item => item.activo)
    .sort((a, b) => a.orden - b.orden);

  let htmlResult = '';

  sortedActiveItems.forEach((item, index) => {
    let itemHtml = template
      .replaceAll('{{urlImagen}}', item.urlImagen)
      .replaceAll('${orden}', index + 1);

    htmlResult += itemHtml;
  });

  container.innerHTML = htmlResult;
}
