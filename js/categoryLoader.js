import CollectionRepository from '../src/repositories/CollectionRepository.js';
import CategoryRepository from '../src/repositories/CategoryRepository.js';
import ProductRepository from '../src/repositories/ProductRepository.js';
import { categoryObserver } from '../src/utils/CategoryChangeObserver.js';
import { updateFavoriteStates } from './components/favorites.js';

/**
 * public VIEW layer controller - Coordinates loading and rendering of category.html catalog.
 * Clean Code: Separates concerns, implements pure functions for HTML generation, dynamic binding.
 */

// Selected filters state
const activeFilters = {
  colores: [],
  tallas: [],
  precios: [], // array of objects { min, max }
  ordenarPor: 'recomendados'
};

let currentCategoryId = null;
let currentCollectionId = null;

document.addEventListener('DOMContentLoaded', () => {
  initCategoryCatalog();
});

/**
 * Initializes catalog: parses URL parameters, loads metadata and triggers renders
 */
async function initCategoryCatalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get('collection');
  const categorySlug = urlParams.get('category');

  console.log('DIAGNOSTIC [initCategoryCatalog] - URL Params:', { collectionId, categorySlug });

  if (!collectionId || !categorySlug) {
    console.warn('DIAGNOSTIC [initCategoryCatalog] - Missing parameters, redirecting to index.html');
    window.location.replace('../index.html');
    return;
  }

  currentCollectionId = collectionId;

  try {
    const collection = await CollectionRepository.findById(collectionId);
    const category = await CategoryRepository.findBySlug(categorySlug);
    console.log('DIAGNOSTIC [initCategoryCatalog] - Collection found:', collection);
    console.log('DIAGNOSTIC [initCategoryCatalog] - Category found:', category);

    if (!category) {
      document.getElementById('category-title').textContent = 'Categoría no encontrada';
      document.getElementById('category-description').textContent = '';
      console.warn('DIAGNOSTIC [initCategoryCatalog] - Category not found for slug:', categorySlug);
      return;
    }

    currentCategoryId = category.id;
    console.log('DIAGNOSTIC [initCategoryCatalog] - currentCategoryId set to:', currentCategoryId);

    document.getElementById('category-title').textContent = category.nombre;
    document.getElementById('category-description').textContent = category.descripcion || 'Descubre nuestra colección exclusiva.';
    
    const collectionBread = document.getElementById('breadcrumb-collection');
    collectionBread.textContent = collection ? collection.nombre : collectionId;
    collectionBread.href = `../index.html`;
    document.getElementById('breadcrumb-category').textContent = category.nombre;

    const allProducts = await ProductRepository.findByCategory(category.id);
    console.log('DIAGNOSTIC [initCategoryCatalog] - allProducts in DB:', allProducts);
    const activeProducts = allProducts.filter(p => p.activo);
    console.log('DIAGNOSTIC [initCategoryCatalog] - activeProducts in DB:', activeProducts);



    setupDynamicFilters(activeProducts);
    
    const sortSelect = document.getElementById('sort-products-select');
    sortSelect.addEventListener('change', (e) => {
      activeFilters.ordenarPor = e.target.value;
      renderFilteredProducts();
    });

    document.querySelectorAll('.price-range-chk').forEach(chk => {
      const min = Number(chk.dataset.min);
      const max = Number(chk.dataset.max);

      if (chk.checked) {
        activeFilters.precios.push({ min, max });
      }

      chk.addEventListener('change', () => {
        if (chk.checked) {
          if (!activeFilters.precios.some(r => r.min === min && r.max === max)) {
            activeFilters.precios.push({ min, max });
          }
        } else {
          activeFilters.precios = activeFilters.precios.filter(r => r.min !== min || r.max !== max);
        }
        renderFilteredProducts();
      });
    });

    // Suscribirse a cambios en tiempo real
    categoryObserver.subscribe(async () => {
      console.log('DIAGNOSTIC [categoryLoader] - Real-time database update detected.');
      const updatedProducts = await ProductRepository.findByCategory(category.id);
      const updatedActiveProducts = updatedProducts.filter(p => p.activo);
      


      setupDynamicFilters(updatedActiveProducts);
      await renderFilteredProducts();
    });

    await renderFilteredProducts();

    const grid = document.getElementById('products-grid-catalog');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card-custom');
        const isFavBtn = e.target.closest('.fav-btn');
        if (card && !isFavBtn) {
          const productId = card.dataset.productId;
          if (productId) {
            window.location.href = `../producto-detalle/producto-detalle.html?id=${productId}`;
          }
        }
      });
    }
  } catch (err) {
    console.error('Error al iniciar el catálogo:', err);
  }
}

/**
 * Extrae y configura los filtros dinámicos (colores y tallas) basados en el inventario real
 */
function setupDynamicFilters(products) {
  // Extraer todos los colores únicos
  const allColors = new Set();
  products.forEach(p => p.colores.forEach(c => allColors.add(c)));

  const colorsList = document.getElementById('colors-filter-list');
  colorsList.innerHTML = Array.from(allColors).map(color => `
    <li>
      <label>
        <input type="checkbox" class="color-filter-chk" value="${color}"> ${color}
      </label>
    </li>
  `).join('');

  // Enlazar listeners de color
  colorsList.querySelectorAll('.color-filter-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) {
        activeFilters.colores.push(chk.value);
      } else {
        activeFilters.colores = activeFilters.colores.filter(c => c !== chk.value);
      }
      renderFilteredProducts();
    });
  });

  // Extraer todas las tallas únicas
  const allSizes = new Set();
  products.forEach(p => p.tallas.forEach(s => allSizes.add(s)));

  // Ordenar tallas (infantiles numéricas o adultos alfabéticas)
  const sortedSizes = Array.from(allSizes).sort((a, b) => {
    const isNumA = !isNaN(a);
    const isNumB = !isNaN(b);
    if (isNumA && isNumB) return Number(a) - Number(b);
    
    const sizeOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
    return (sizeOrder[a] || 99) - (sizeOrder[b] || 99);
  });

  const sizesGrid = document.getElementById('sizes-filter-grid');
  sizesGrid.innerHTML = sortedSizes.map(size => `
    <button class="size-btn" data-size="${size}">${size}</button>
  `).join('');

  // Enlazar listeners de tallas
  sizesGrid.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      const isActive = btn.classList.toggle('active');

      if (isActive) {
        activeFilters.tallas.push(size);
      } else {
        activeFilters.tallas = activeFilters.tallas.filter(s => s !== size);
      }
      renderFilteredProducts();
    });
  });
}

/**
 * Consulta el repositorio con filtros y renderiza la lista final en la cuadrícula
 */
async function renderFilteredProducts() {
  const grid = document.getElementById('products-grid-catalog');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem;"></i>
    </div>
  `;

  // Construir filtros estructurados para el ProductRepository
  const queryFilters = {
    colores: activeFilters.colores,
    tallas: activeFilters.tallas,
    ordenarPor: activeFilters.ordenarPor,
    soloActivos: true
  };

  try {
    console.log('DEBUG [renderFilteredProducts] - calling findWithFilters with currentCategoryId:', currentCategoryId, 'queryFilters:', queryFilters);
    let products = await ProductRepository.findWithFilters(currentCategoryId, queryFilters);
    console.log('DEBUG [renderFilteredProducts] - products returned:', products);

    // Filtrado por precio (OR entre los rangos seleccionados)
    if (activeFilters.precios.length > 0) {
      products = products.filter(p => 
        activeFilters.precios.some(range => p.precio >= range.min && p.precio <= range.max)
      );
    }

    // Actualizar contador
    document.getElementById('products-count-label').textContent = `Mostrando ${products.length} de ${products.length} productos`;

    if (products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
          <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; display: block; color: #ddd;"></i>
          No se encontraron productos que coincidan con los filtros seleccionados.
        </div>
      `;
      return;
    }

    let html = '';
    products.forEach(prod => {
      const isBase64 = prod.urlImagen.startsWith('data:image/');
      const isAbsolute = prod.urlImagen.includes('://') || prod.urlImagen.startsWith('//');
      
      // Dado que category.html se ubica en /Pages/, debemos retroceder un nivel para imágenes relativas
      const imageSrc = (isBase64 || isAbsolute) ? prod.urlImagen : `../${prod.urlImagen}`;

      const discountBadgeHtml = prod.descuento > 0 
        ? `<div class="card-badge">-${prod.descuento}%</div>` 
        : '';

      const priceRowHtml = prod.descuento > 0
        ? `
          <span class="price-current">S/ ${prod.precio.toFixed(2)}</span>
          <span class="price-old">S/ ${prod.precioOriginal.toFixed(2)}</span>
        `
        : `<span class="price-current">S/ ${prod.precioOriginal.toFixed(2)}</span>`;

      // Campo adicional en etiqueta secundaria si aplica
      let tagLabel = 'Moda Premium';
      if (prod.collectionId === 'mujer' && prod.tipoTela) {
        tagLabel = prod.tipoTela;
      } else if (prod.collectionId === 'kids' && prod.edadRecomendada) {
        tagLabel = `Edad: ${prod.edadRecomendada}`;
      }

      html += `
        <div class="product-card-custom" data-product-id="${prod.id}">
          <div class="card-img-wrap">
            <img src="${imageSrc}" alt="${prod.nombre}" loading="lazy">
            ${discountBadgeHtml}
          </div>
          <button class="fav-btn" aria-label="Agregar a favoritos"><i class="fa-regular fa-heart"></i></button>
          <div class="card-details">
            <span class="card-tag">${tagLabel}</span>
            <h2 class="card-title">${prod.nombre}</h2>
            <div class="card-price-row">
              ${priceRowHtml}
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
    updateFavoriteStates();
  } catch (err) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: #ef4444; padding: 20px; text-align: center;">Error al cargar catálogo: ${err.message}</div>`;
  }
}
