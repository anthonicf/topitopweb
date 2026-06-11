import HomeSectionTopController from '../../controllers/HomeSectionTopController.js';
import HomeSectionSearchController from '../../controllers/HomeSectionSearchController.js';
import HomeSectionKidsController from '../../controllers/HomeSectionKidsController.js';
import AdminAuthController from '../../controllers/AdminAuthController.js';
import { bindImagePreview } from '../../utils/imagePreview.js';

// Repositories
import CollectionRepository from '../../repositories/CollectionRepository.js';
import CategoryRepository from '../../repositories/CategoryRepository.js';
import ProductRepository from '../../repositories/ProductRepository.js';

// Models & strategies
import ProductFactory from '../../models/ProductFactory.js';
import { ValidationStrategyFactory } from '../../strategies/ProductValidationStrategy.js';

// Observer
import { categoryObserver } from '../../utils/CategoryChangeObserver.js';

/**
 * Resuelve la ruta de la imagen, evitando agregar '../../..' si es Base64 o URL absoluta.
 * @param {string} urlImagen
 * @returns {string}
 */
function resolveImageSrc(urlImagen) {
  if (!urlImagen) return 'https://placehold.co/150?text=Sin+Imagen';
  if (urlImagen.startsWith('data:image/') || urlImagen.includes('://') || urlImagen.startsWith('//')) {
    return urlImagen;
  }
  return `../../../${urlImagen}`;
}

/**
 * Comprime una imagen en el cliente utilizando Canvas. Retorna la cadena Base64.
 * Redimensiona a un máximo de 800px y reduce calidad a 0.7.
 * @param {File} file
 * @returns {Promise<string>}
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(new Error('No se pudo cargar la imagen para compresión.'));
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// VIEW layer - Admin dashboard main presentation coordinator
const authController = new AdminAuthController();
const topController = new HomeSectionTopController();
const searchController = new HomeSectionSearchController();
const kidsController = new HomeSectionKidsController();

// App states
let activeSection = 'top'; // 'top' | 'search' | 'kids' | 'categories' | 'products'
let currentCollectionId = null;
let currentCategoryId = null;
let editingItemId = null; // null cuando agregamos

const SELECTORS = {
  sectionTitle: 'section-title',
  contentContainer: 'content-container',
  addItemBtn: 'add-item-btn',
  logoutBtn: 'logout-btn',
  toastContainer: 'toast-container',
  modalContainer: 'modal-container',
  sidebarMenuItems: '.sidebar-menu .menu-item'
};

document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupGlobalActions();
  setupRouting();
  
  // Triggers initial routing
  handleRouting();
});

/**
 * Muestra una notificación temporal en pantalla (Toast).
 */
function showToast(message, isError = false) {
  const container = document.getElementById(SELECTORS.toastContainer);
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  toast.innerHTML = `
    <i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
  }, 4000);
}

/**
 * Enrutador Hash del panel de administración
 */
function setupRouting() {
  window.addEventListener('hashchange', handleRouting);
}

async function handleRouting() {
  const hash = window.location.hash || '#top';
  
  // Remover active de todos los items del sidebar
  document.querySelectorAll('.sidebar-menu .menu-item, .submenu-item').forEach(el => {
    el.classList.remove('active');
  });

  // Ocultar botón general "Agregar Nuevo" (cada tabla dinámica tendrá el suyo propio)
  document.getElementById(SELECTORS.addItemBtn).style.display = 'none';

  if (hash === '#top' || hash === '#search' || hash === '#kids') {
    activeSection = hash.substring(1);
    
    // Activar item clásico del sidebar
    const activeEl = document.querySelector(`.sidebar-menu .menu-item[data-section="${activeSection}"]`);
    if (activeEl) activeEl.classList.add('active');
    
    updateHeaderTitle();
    await loadHomeSection();
  } 
  else if (hash.startsWith('#/admin/colecciones/')) {
    const routePath = hash.substring(2); // "admin/colecciones/hombre/categorias" ...
    const parts = routePath.split('/');

    if (parts.length === 4 && parts[3] === 'categorias') {
      activeSection = 'categories';
      currentCollectionId = parts[2];
      
      // Expandir y activar grupo en sidebar
      const groupEl = document.getElementById(`group-${currentCollectionId}`);
      if (groupEl) groupEl.classList.add('expanded');
      
      await loadCategoriesSection(currentCollectionId);
    } 
    else if (parts.length === 6 && parts[3] === 'categorias' && parts[5] === 'productos') {
      activeSection = 'products';
      currentCollectionId = parts[2];
      currentCategoryId = parts[4];
      
      // Expandir grupo en sidebar
      const groupEl = document.getElementById(`group-${currentCollectionId}`);
      if (groupEl) groupEl.classList.add('expanded');

      // Activar subcategoría en sidebar
      const subItem = document.querySelector(`.submenu-item[data-category-id="${currentCategoryId}"]`);
      if (subItem) subItem.classList.add('active');

      await loadProductsSection(currentCollectionId, currentCategoryId);
    }
  } else {
    window.location.hash = '#top';
  }
}

/**
 * Escucha y maneja la navegación del Sidebar lateral.
 */
async function setupSidebarNavigation() {
  // Configurar colapso de acordeón
  document.querySelectorAll('.sidebar-menu-header').forEach(header => {
    header.addEventListener('click', (e) => {
      const group = header.parentElement;
      const collectionId = group.dataset.collection;
      
      // Toggle expandido
      const isExpanded = group.classList.toggle('expanded');
      
      if (isExpanded) {
        // Redirigir a vista de categorías de esta colección
        window.location.hash = `#/admin/colecciones/${collectionId}/categorias`;
      }
    });
  });

  // Configurar items clásicos (Top, Buscado, Kids)
  document.querySelectorAll(SELECTORS.sidebarMenuItems).forEach(item => {
    item.addEventListener('click', () => {
      window.location.hash = `#${item.dataset.section}`;
    });
  });

  // Renderizar categorías del sidebar dinámicamente
  await renderSidebarCategories();
  
  // Suscribirse a cambios en categorías para refrescar el sidebar
  categoryObserver.subscribe('category_change', async () => {
    await renderSidebarCategories();
  });
}

/**
 * Carga y renderiza los submenús de categorías de cada colección en el sidebar
 */
async function renderSidebarCategories() {
  const collections = ['hombre', 'mujer', 'kids'];

  for (const colId of collections) {
    const submenu = document.getElementById(`submenu-${colId}`);
    if (!submenu) continue;

    const categories = await CategoryRepository.findByCollection(colId);
    let html = '';

    categories.forEach(cat => {
      if (!cat.activo) return;
      html += `
        <li class="submenu-item" data-category-id="${cat.id}">
          <button onclick="window.location.hash='#/admin/colecciones/${colId}/categorias/${cat.id}/productos'">
            <i class="fa-solid fa-angle-right"></i> ${cat.nombre}
          </button>
        </li>
      `;
    });

    // Añadir botón "+ Nueva categoría"
    html += `
      <li style="padding: 0 12px; margin-top: 4px;">
        <button class="submenu-item btn-add-submenu-category" id="btn-sidebar-add-cat-${colId}" style="width:100%; border-radius:6px; font-size:0.8rem; padding:6px; cursor:pointer; text-align:center; justify-content:center; display:flex; gap:6px; align-items:center;">
          <i class="fa-solid fa-plus"></i> Nueva categoría
        </button>
      </li>
    `;

    submenu.innerHTML = html;

    // Agregar evento al botón "+ Nueva categoría"
    document.getElementById(`btn-sidebar-add-cat-${colId}`).addEventListener('click', (e) => {
      e.stopPropagation();
      openCategoryModal(colId);
    });
  }
}

/**
 * Actualiza el título y subtítulo de la cabecera para las secciones estáticas.
 */
function updateHeaderTitle() {
  const titleEl = document.getElementById(SELECTORS.sectionTitle);
  const descEl = titleEl.nextElementSibling;

  const titles = {
    top: { text: 'Sección "Lo más TOP"', desc: 'Edita los productos destacados de la página de inicio.' },
    search: { text: 'Sección "Lo más buscado"', desc: 'Gestiona los enlaces de categorías de calzado y accesorios.' },
    kids: { text: 'Sección "Kids TOP (Carrusel)"', desc: 'Organiza la galería de fotos del carrusel infantil.' }
  };

  titleEl.textContent = titles[activeSection].text;
  descEl.textContent = titles[activeSection].desc;
}

/**
 * Registra acciones globales adicionales.
 */
function setupGlobalActions() {
  document.getElementById(SELECTORS.logoutBtn).addEventListener('click', async () => {
    if (confirm('¿Está seguro de que desea cerrar la sesión administrativa?')) {
      await authController.logout();
      window.location.replace('./login.html');
    }
  });
}

/**
 * Carga e inyecta la plantilla para las secciones estáticas del home.
 */
async function loadHomeSection() {
  const container = document.getElementById(SELECTORS.contentContainer);
  container.innerHTML = `
    <div class="loading-overlay">
      <i class="fa-solid fa-circle-notch loading-spinner"></i>
    </div>
  `;

  try {
    const templatePath = `./partials/${activeSection}Table.html`;
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error('No se pudo cargar la plantilla de la tabla.');
    
    container.innerHTML = await response.text();
    
    // Configurar e inyectar el botón "Agregar Nuevo" clásico
    const addBtn = document.getElementById(SELECTORS.addItemBtn);
    addBtn.style.display = 'flex';
    addBtn.onclick = () => openFormModal();

    await renderTableData();
  } catch (error) {
    showToast(`Error al cargar sección: ${error.message}`, true);
  }
}

/**
 * Renderiza los datos de las secciones estáticas del home.
 */
async function renderTableData() {
  const controller = getActiveController();
  const items = await controller.getAllItems();

  const renderers = {
    top: renderTopRows,
    search: renderSearchRows,
    kids: renderKidsRows
  };

  renderers[activeSection](items);
}

function getActiveController() {
  const controllers = {
    top: topController,
    search: searchController,
    kids: kidsController
  };
  return controllers[activeSection];
}

function getStatusBadgeHtml(isActive) {
  return isActive 
    ? '<span class="badge badge-active">Activo</span>' 
    : '<span class="badge badge-inactive">Oculto</span>';
}

function getToggleBtnHtml(isActive) {
  const icon = isActive ? 'fa-eye-slash' : 'fa-eye';
  const label = isActive ? 'Ocultar' : 'Mostrar';
  return `<button class="btn-action btn-toggle" title="${label}"><i class="fa-solid ${icon}"></i></button>`;
}

function bindRowActionEvents(rowElement, itemId) {
  const controller = getActiveController();

  rowElement.querySelector('.btn-toggle').addEventListener('click', async () => {
    try {
      await controller.toggleVisibility(itemId);
      showToast('Visibilidad de item actualizada.');
      await loadHomeSection();
    } catch (e) {
      showToast(e.message, true);
    }
  });

  rowElement.querySelector('.btn-edit').addEventListener('click', () => {
    openFormModal(itemId);
  });

  rowElement.querySelector('.btn-delete').addEventListener('click', async () => {
    if (confirm('¿Está seguro de que desea eliminar este elemento de forma permanente?')) {
      try {
        await controller.deleteItem(itemId);
        showToast('Elemento eliminado exitosamente.');
        await loadHomeSection();
      } catch (e) {
        showToast(e.message, true);
      }
    }
  });
}

function renderTopRows(items) {
  const tbody = document.getElementById('top-table-body');
  tbody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    if (!item.activo) row.className = 'inactive';

    const discountText = item.descuento > 0 ? `-${item.descuento}%` : 'Sin dcto.';
    row.innerHTML = `
      <td class="admin-td-image"><img src="${resolveImageSrc(item.urlImagen)}" class="admin-table-thumbnail" alt="${item.nombre}"></td>
      <td class="admin-td" style="font-weight: 600;">${item.nombre}</td>
      <td class="admin-td">${item.color}</td>
      <td class="admin-td" style="font-weight: 500;">S/ ${item.precio.toFixed(2)}</td>
      <td class="admin-td"><span style="color: ${item.descuento > 0 ? '#10b981' : 'var(--text-muted)'};">${discountText}</span></td>
      <td class="admin-td" style="text-transform: capitalize;">${item.genero}</td>
      <td class="admin-td">${getStatusBadgeHtml(item.activo)}</td>
      <td class="admin-td actions-cell">
        ${getToggleBtnHtml(item.activo)}
        <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    bindRowActionEvents(row, item.id);
    tbody.appendChild(row);
  });
}

function renderSearchRows(items) {
  const tbody = document.getElementById('search-table-body');
  tbody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    if (!item.activo) row.className = 'inactive';

    row.innerHTML = `
      <td class="admin-td-image"><img src="${resolveImageSrc(item.urlImagen)}" class="admin-table-thumbnail" alt="Categoría"></td>
      <td class="admin-td" style="font-weight: 600;">${item.categoria}</td>
      <td class="admin-td">${item.subcategoria}</td>
      <td class="admin-td">${getStatusBadgeHtml(item.activo)}</td>
      <td class="admin-td actions-cell">
        ${getToggleBtnHtml(item.activo)}
        <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    bindRowActionEvents(row, item.id);
    tbody.appendChild(row);
  });
}

function renderKidsRows(items) {
  const tbody = document.getElementById('kids-table-body');
  tbody.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('tr');
    if (!item.activo) row.className = 'inactive';

    row.innerHTML = `
      <td class="admin-td-image"><img src="${resolveImageSrc(item.urlImagen)}" class="admin-table-thumbnail" alt="Galería Kids"></td>
      <td class="admin-td" style="font-weight: 600;">Posición ${item.orden}</td>
      <td class="admin-td">${getStatusBadgeHtml(item.activo)}</td>
      <td class="admin-td actions-cell">
        ${getToggleBtnHtml(item.activo)}
        <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    bindRowActionEvents(row, item.id);
    tbody.appendChild(row);
  });
}

/**
 * Carga e inicializa el modal del formulario CRUD clásico (Lo más TOP/Buscado).
 */
async function openFormModal(itemId = null) {
  editingItemId = itemId;
  const container = document.getElementById(SELECTORS.modalContainer);

  try {
    const response = await fetch('./partials/itemFormModal.html');
    if (!response.ok) throw new Error('No se pudo cargar el modal del formulario.');
    
    container.innerHTML = await response.text();
    setupModalElements(itemId);
  } catch (error) {
    showToast(`Error al abrir modal: ${error.message}`, true);
  }
}

function setupModalElements(itemId) {
  const modal = document.getElementById('item-modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const form = document.getElementById('item-form');
  
  titleEl.textContent = itemId ? 'Editar Elemento' : 'Agregar Nuevo Elemento';

  // Mostrar los inputs de la sección actual
  document.getElementById(`fields-${activeSection}`).style.display = 'block';

  // Componentes de Pestañas e Inputs de Imagen
  const tabUpload = document.getElementById('btn-tab-upload');
  const tabUrl = document.getElementById('btn-tab-url');
  const contentUpload = document.getElementById('tab-content-upload');
  const contentUrl = document.getElementById('tab-content-url');
  
  const urlInput = document.getElementById('form-url-imagen');
  const previewImg = document.getElementById('form-img-preview');
  
  const fileInput = document.getElementById('form-file-input');
  const dropzoneArea = document.getElementById('dropzone-area');
  const fileInfoContainer = document.getElementById('file-info-container');
  const fileDisplayName = document.getElementById('uploaded-file-display-name');
  const removeFileBtn = document.getElementById('btn-remove-uploaded-file');

  function switchTab(mode) {
    if (mode === 'upload') {
      tabUpload.classList.add('active');
      tabUrl.classList.remove('active');
      contentUpload.style.display = 'block';
      contentUrl.style.display = 'none';
    } else {
      tabUpload.classList.remove('active');
      tabUrl.classList.add('active');
      contentUpload.style.display = 'none';
      contentUrl.style.display = 'block';
    }
  }

  tabUpload.addEventListener('click', () => switchTab('upload'));
  tabUrl.addEventListener('click', () => switchTab('url'));

  dropzoneArea.addEventListener('click', () => fileInput.click());

  dropzoneArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneArea.classList.add('dragover');
  });

  dropzoneArea.addEventListener('dragleave', () => {
    dropzoneArea.classList.remove('dragover');
  });

  dropzoneArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzoneArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelection(e.target.files[0]);
    }
  });

  async function handleFileSelection(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecciona una imagen válida.', true);
      return;
    }

    try {
      showToast('Procesando y optimizando imagen...');
      const base64Data = await compressImage(file);
      urlInput.value = base64Data;
      previewImg.src = base64Data;
      fileDisplayName.textContent = file.name;
      fileInfoContainer.style.display = 'block';
      showToast('Imagen cargada con éxito.');
    } catch (err) {
      showToast(`Error al procesar la imagen: ${err.message}`, true);
    }
  }

  removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    urlInput.value = '';
    fileInfoContainer.style.display = 'none';
    previewImg.src = 'https://placehold.co/150?text=Sin+Imagen';
  });

  bindImagePreview(urlInput, previewImg);

  if (itemId) {
    populateFormForEdit(itemId, previewImg, {
      tabUpload,
      tabUrl,
      contentUpload,
      contentUrl,
      fileInfoContainer,
      fileDisplayName
    });
  }

  const closeModal = () => modal.remove();
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', (e) => handleFormSubmit(e, closeModal));
}

async function populateFormForEdit(itemId, previewImg, elements = {}) {
  const controller = getActiveController();
  const item = await controller.getItemById(itemId);

  const urlInput = document.getElementById('form-url-imagen');
  urlInput.value = item.urlImagen;
  previewImg.src = resolveImageSrc(item.urlImagen);
  document.getElementById('form-activo').checked = item.activo;

  const isBase64 = item.urlImagen.startsWith('data:image/');
  
  if (isBase64) {
    if (elements.tabUpload) {
      elements.tabUpload.classList.add('active');
      elements.tabUrl.classList.remove('active');
      elements.contentUpload.style.display = 'block';
      elements.contentUrl.style.display = 'none';
      elements.fileDisplayName.textContent = 'Imagen guardada (Base64)';
      elements.fileInfoContainer.style.display = 'block';
    }
  } else {
    if (elements.tabUpload) {
      elements.tabUpload.classList.remove('active');
      elements.tabUrl.classList.add('active');
      elements.contentUpload.style.display = 'none';
      elements.contentUrl.style.display = 'block';
      elements.fileInfoContainer.style.display = 'none';
    }
  }

  if (activeSection === 'top') {
    document.getElementById('form-nombre').value = item.nombre;
    document.getElementById('form-color').value = item.color;
    document.getElementById('form-precio').value = item.precio;
    document.getElementById('form-descuento').value = item.descuento;
    document.getElementById('form-genero').value = item.genero;
  } else if (activeSection === 'search') {
    document.getElementById('form-categoria').value = item.categoria;
    document.getElementById('form-subcategoria').value = item.subcategoria;
  } else if (activeSection === 'kids') {
    document.getElementById('form-orden').value = item.orden;
  }
}

function serializeFormFields() {
  const formData = {
    urlImagen: document.getElementById('form-url-imagen').value.trim(),
    activo: document.getElementById('form-activo').checked
  };

  if (activeSection === 'top') {
    formData.nombre = document.getElementById('form-nombre').value.trim();
    formData.color = document.getElementById('form-color').value.trim();
    formData.precio = Number(document.getElementById('form-precio').value);
    formData.descuento = Number(document.getElementById('form-descuento').value);
    formData.genero = document.getElementById('form-genero').value;
  } else if (activeSection === 'search') {
    formData.categoria = document.getElementById('form-categoria').value;
    formData.subcategoria = document.getElementById('form-subcategoria').value;
  } else if (activeSection === 'kids') {
    formData.orden = Number(document.getElementById('form-orden').value);
  }

  return formData;
}

async function handleFormSubmit(event, closeCallback) {
  event.preventDefault();
  const controller = getActiveController();
  const payload = serializeFormFields();

  try {
    if (editingItemId) {
      await controller.updateItem(editingItemId, payload);
      showToast('Elemento actualizado con éxito.');
    } else {
      await controller.createItem(payload);
      showToast('Elemento creado con éxito.');
    }

    closeCallback();
    await loadHomeSection();
  } catch (error) {
    showToast(error.message, true);
  }
}


/* ==========================================================================
   === NUEVA LOGICA DE GESTION DE CATEGORIAS Y PRODUCTOS DINAMICOS ===
   ========================================================================== */

/**
 * Carga e inyecta la vista de Categorías para una Colección específica.
 * URL simulada: #/admin/colecciones/:collectionId/categorias
 */
async function loadCategoriesSection(collectionId) {
  const container = document.getElementById(SELECTORS.contentContainer);
  container.innerHTML = `
    <div class="loading-overlay">
      <i class="fa-solid fa-circle-notch loading-spinner"></i>
    </div>
  `;

  try {
    // Configurar cabecera
    const titleEl = document.getElementById(SELECTORS.sectionTitle);
    const descEl = titleEl.nextElementSibling;
    const collection = await CollectionRepository.findById(collectionId);
    
    titleEl.textContent = `Categorías: ${collection ? collection.nombre : collectionId}`;
    descEl.textContent = `Edita las categorías correspondientes a la sección del catálogo.`;

    const response = await fetch('./partials/categoriesTable.html');
    if (!response.ok) throw new Error('No se pudo cargar la tabla de categorías.');

    container.innerHTML = await response.text();

    // Configurar botón "Nueva Categoría"
    document.getElementById('add-category-btn').addEventListener('click', () => {
      openCategoryModal(collectionId);
    });

    await renderCategoriesTable(collectionId);
  } catch (error) {
    showToast(`Error: ${error.message}`, true);
  }
}

/**
 * Renderiza la lista de categorías e inicializa el Drag and Drop
 */
async function renderCategoriesTable(collectionId) {
  const tbody = document.getElementById('categories-table-body');
  if (!tbody) return;

  const categories = await CategoryRepository.findByCollection(collectionId);
  tbody.innerHTML = '';

  categories.forEach(cat => {
    const row = document.createElement('tr');
    row.dataset.id = cat.id;
    row.setAttribute('draggable', 'true');
    if (!cat.activo) row.className = 'inactive';

    row.innerHTML = `
      <td class="admin-td-image" style="cursor: grab;">
        <img src="${resolveImageSrc(cat.urlImagenPortada)}" class="admin-table-thumbnail" alt="${cat.nombre}">
      </td>
      <td class="admin-td" style="font-weight: 600;">${cat.nombre}</td>
      <td class="admin-td"><code>/${cat.slug}</code></td>
      <td class="admin-td">${cat.orden}</td>
      <td class="admin-td">${getStatusBadgeHtml(cat.activo)}</td>
      <td class="admin-td actions-cell">
        <button class="btn-action btn-toggle" title="Alternar Visibilidad"><i class="fa-solid ${cat.activo ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
        <button class="btn-action btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    // Eventos
    row.querySelector('.btn-toggle').addEventListener('click', async () => {
      await CategoryRepository.toggleVisibility(cat.id);
      showToast('Estado de la categoría modificado.');
      categoryObserver.notify('category_change', null);
      await renderCategoriesTable(collectionId);
    });

    row.querySelector('.btn-edit').addEventListener('click', () => {
      openCategoryModal(collectionId, cat.id);
    });

    row.querySelector('.btn-delete').addEventListener('click', async () => {
      try {
        await CategoryRepository.delete(cat.id);
        showToast('Categoría eliminada con éxito.');
        categoryObserver.notify('category_change', null);
        await loadCategoriesSection(collectionId);
      } catch (err) {
        if (err.message.startsWith('HAS_PRODUCTS:')) {
          const count = err.message.split(':')[1];
          
          if (confirm(`Esta categoría tiene ${count} productos asociados.\n¿Desea desactivar la categoría en su lugar (Ocultarla) para no perder los productos?\n\nPresione [Aceptar] para Desactivar o [Cancelar] si desea eliminar todo permanentemente.`)) {
            // Desactivar en su lugar
            await CategoryRepository.update(cat.id, { activo: false });
            showToast('Categoría ocultada con éxito.');
            categoryObserver.notify('category_change', null);
            await loadCategoriesSection(collectionId);
          } else {
            // Eliminar permanentemente
            if (confirm('ATENCIÓN: Se eliminará la categoría y TODOS sus productos asociados de manera irreversible. ¿Está seguro?')) {
              // Borrar productos
              const products = await ProductRepository.findByCategory(cat.id);
              for (const p of products) {
                await ProductRepository.delete(p.id);
              }
              // Borrar categoría forzadamente (temporalmente limpiamos para evitar validaciones de subproductos)
              const list = CategoryRepository._loadAll();
              const idx = list.findIndex(c => c.id === cat.id);
              if (idx !== -1) {
                list.splice(idx, 1);
                CategoryRepository._saveAll(list);
              }
              showToast('Categoría y productos eliminados permanentemente.');
              categoryObserver.notify('category_change', null);
              await loadCategoriesSection(collectionId);
            }
          }
        } else {
          showToast(err.message, true);
        }
      }
    });

    tbody.appendChild(row);
  });

  // Habilitar Drag & Drop
  const rows = tbody.querySelectorAll('tr');
  makeCategoriesDraggable(rows, categories, async (reorderedList) => {
    CategoryRepository._saveAll(reorderedList);
    showToast('Orden de categorías actualizado.');
    categoryObserver.notify('category_change', null);
    await renderCategoriesTable(collectionId);
  });
}

/**
 * Lógica drag and drop para reordenar categorías en la tabla
 */
function makeCategoriesDraggable(rows, list, saveCallback) {
  let draggedId = null;

  rows.forEach(row => {
    row.addEventListener('dragstart', (e) => {
      draggedId = row.dataset.id;
      row.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    row.addEventListener('dragend', () => {
      row.style.opacity = '1';
      rows.forEach(r => r.style.border = 'none');
    });

    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      row.style.borderTop = '2px solid var(--primary-color)';
    });

    row.addEventListener('dragleave', () => {
      row.style.border = 'none';
    });

    row.addEventListener('drop', async (e) => {
      e.preventDefault();
      row.style.border = 'none';
      const targetId = row.dataset.id;
      
      if (draggedId && draggedId !== targetId) {
        const draggedIndex = list.findIndex(item => item.id === draggedId);
        const targetIndex = list.findIndex(item => item.id === targetId);

        // Mover ítem
        const [movedItem] = list.splice(draggedIndex, 1);
        list.splice(targetIndex, 0, movedItem);

        // Reasignar orden
        list.forEach((item, index) => {
          item.orden = index + 1;
        });

        await saveCallback(list);
      }
    });
  });
}

/**
 * Carga e inyecta la vista de Productos para una Categoría.
 * URL simulada: #/admin/colecciones/:collectionId/categorias/:categoryId/productos
 */
async function loadProductsSection(collectionId, categoryId) {
  const container = document.getElementById(SELECTORS.contentContainer);
  container.innerHTML = `
    <div class="loading-overlay">
      <i class="fa-solid fa-circle-notch loading-spinner"></i>
    </div>
  `;

  try {
    const titleEl = document.getElementById(SELECTORS.sectionTitle);
    const descEl = titleEl.nextElementSibling;
    
    const collection = await CollectionRepository.findById(collectionId);
    const category = await CategoryRepository.findById(categoryId);

    titleEl.textContent = `Gestión de Productos`;
    descEl.textContent = `Administra el inventario de la subcategoría seleccionada.`;

    const response = await fetch('./partials/productsTable.html');
    if (!response.ok) throw new Error('No se pudo cargar la tabla de productos.');

    container.innerHTML = await response.text();

    // Llenar Breadcrumbs
    document.getElementById('breadcrumb-collection').textContent = collection ? collection.nombre : collectionId;
    document.getElementById('breadcrumb-category').textContent = category ? category.nombre : categoryId;

    // Listeners de Filtros
    const statusFilter = document.getElementById('filter-status');
    const priceFilter = document.getElementById('filter-price-max');

    const triggerSearch = async () => {
      const filters = {
        soloActivos: statusFilter.value === 'activos' ? true : (statusFilter.value === 'inactivos' ? false : null),
        precioMax: priceFilter.value ? Number(priceFilter.value) : null
      };
      
      // Si el filtro es inactivos, cargamos todos y filtramos localmente en la tabla
      await renderProductsTable(collectionId, categoryId, filters);
    };

    statusFilter.addEventListener('change', triggerSearch);
    priceFilter.addEventListener('input', triggerSearch);

    // Botón Agregar Producto
    document.getElementById('add-product-btn').addEventListener('click', () => {
      openProductModal(collectionId, categoryId);
    });

    await renderProductsTable(collectionId, categoryId);
  } catch (error) {
    showToast(`Error: ${error.message}`, true);
  }
}

/**
 * Renderiza la lista de productos de una categoría
 */
async function renderProductsTable(collectionId, categoryId, filters = {}) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  let products = await ProductRepository.findByCategory(categoryId);

  // Aplicar filtros de búsqueda
  if (filters.soloActivos === true) {
    products = products.filter(p => p.activo);
  } else if (filters.soloActivos === false) {
    products = products.filter(p => !p.activo);
  }

  if (filters.precioMax !== undefined && filters.precioMax !== null) {
    products = products.filter(p => p.precio <= filters.precioMax);
  }

  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="admin-td" style="text-align: center; color: var(--text-muted);">No hay productos registrados en esta subcategoría.</td></tr>`;
    return;
  }

  products.forEach(prod => {
    const row = document.createElement('tr');
    if (!prod.activo) row.className = 'inactive';

    const colorsHtml = prod.colores.map(c => `<span style="font-size:0.75rem; border:1px solid var(--border-color); padding:2px 6px; border-radius:4px; margin-right:4px;">${c}</span>`).join('');
    const sizesHtml = prod.tallas.map(s => `<span style="font-size:0.75rem; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px; margin-right:4px; font-weight:600;">${s}</span>`).join('');
    
    row.innerHTML = `
      <td class="admin-td-image"><img src="${resolveImageSrc(prod.urlImagen)}" class="admin-table-thumbnail" alt="${prod.nombre}"></td>
      <td class="admin-td" style="font-weight: 600;">
        ${prod.nombre} 
        ${prod.destacado ? '<i class="fa-solid fa-star" style="color:#f59e0b; margin-left:4px;" title="Destacado (Lo más TOP)"></i>' : ''}
      </td>
      <td class="admin-td" style="font-weight: 500;">S/ ${prod.precio.toFixed(2)}</td>
      <td class="admin-td">
        <span style="color: ${prod.descuento > 0 ? '#10b981' : 'var(--text-muted)'}; font-weight:500;">
          ${prod.descuento > 0 ? `-${prod.descuento}%` : 'Sin dcto.'}
        </span>
      </td>
      <td class="admin-td">${colorsHtml}</td>
      <td class="admin-td">${sizesHtml}</td>
      <td class="admin-td">${getStatusBadgeHtml(prod.activo)}</td>
      <td class="admin-td actions-cell">
        <button class="btn-action btn-toggle" title="Alternar Visibilidad"><i class="fa-solid ${prod.activo ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
        <button class="btn-action btn-edit" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-action btn-action-delete btn-delete" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;

    // Eventos
    row.querySelector('.btn-toggle').addEventListener('click', async () => {
      await ProductRepository.update(prod.id, { activo: !prod.activo });
      showToast('Estado del producto actualizado.');
      await renderProductsTable(collectionId, categoryId, filters);
    });

    row.querySelector('.btn-edit').addEventListener('click', () => {
      openProductModal(collectionId, categoryId, prod.id);
    });

    row.querySelector('.btn-delete').addEventListener('click', async () => {
      if (confirm(`¿Está seguro de que desea eliminar el producto "${prod.nombre}" permanentemente?`)) {
        await ProductRepository.delete(prod.id);
        showToast('Producto eliminado.');
        await renderProductsTable(collectionId, categoryId, filters);
      }
    });

    tbody.appendChild(row);
  });
}

/**
 * Abre el modal de Categoría (Crear/Editar)
 */
async function openCategoryModal(collectionId, categoryId = null) {
  const container = document.getElementById(SELECTORS.modalContainer);

  try {
    const response = await fetch('./partials/categoryFormModal.html');
    if (!response.ok) throw new Error('No se pudo cargar el modal de categoría.');

    container.innerHTML = await response.text();
    setupCategoryModalElements(collectionId, categoryId);
  } catch (error) {
    showToast(`Error al abrir modal: ${error.message}`, true);
  }
}

function setupCategoryModalElements(collectionId, categoryId) {
  const modal = document.getElementById('category-modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const form = document.getElementById('category-form');
  
  titleEl.textContent = categoryId ? 'Editar Categoría' : 'Agregar Nueva Categoría';

  // Forzar colección preseleccionada
  const collectionSelect = document.getElementById('form-collection-id');
  collectionSelect.value = collectionId;

  // Auto-slug
  const nameInput = document.getElementById('form-nombre');
  const slugInput = document.getElementById('form-slug');

  nameInput.addEventListener('input', () => {
    if (!categoryId) { // Solo autogenerar si es nuevo
      slugInput.value = CategoryModel.prototype.generateSlug(nameInput.value);
    }
  });

  // Setup Carga de Portada
  const tabUpload = document.getElementById('btn-tab-upload');
  const tabUrl = document.getElementById('btn-tab-url');
  const contentUpload = document.getElementById('tab-content-upload');
  const contentUrl = document.getElementById('tab-content-url');
  
  const urlInput = document.getElementById('form-url-imagen');
  const previewImg = document.getElementById('form-img-preview');
  
  const fileInput = document.getElementById('form-file-input');
  const dropzoneArea = document.getElementById('dropzone-area');
  const fileInfoContainer = document.getElementById('file-info-container');
  const fileDisplayName = document.getElementById('uploaded-file-display-name');
  const removeFileBtn = document.getElementById('btn-remove-uploaded-file');

  function switchTab(mode) {
    if (mode === 'upload') {
      tabUpload.classList.add('active');
      tabUrl.classList.remove('active');
      contentUpload.style.display = 'block';
      contentUrl.style.display = 'none';
    } else {
      tabUpload.classList.remove('active');
      tabUrl.classList.add('active');
      contentUpload.style.display = 'none';
      contentUrl.style.display = 'block';
    }
  }

  tabUpload.addEventListener('click', () => switchTab('upload'));
  tabUrl.addEventListener('click', () => switchTab('url'));
  dropzoneArea.addEventListener('click', () => fileInput.click());

  dropzoneArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneArea.classList.add('dragover');
  });

  dropzoneArea.addEventListener('dragleave', () => dropzoneArea.classList.remove('dragover'));

  dropzoneArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzoneArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleCoverSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleCoverSelected(e.target.files[0]);
    }
  });

  async function handleCoverSelected(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Seleccione una imagen válida.', true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('La imagen supera el límite de 2MB.', true);
      return;
    }

    try {
      showToast('Comprimiendo...');
      const base64 = await compressImage(file);
      urlInput.value = base64;
      previewImg.src = base64;
      fileDisplayName.textContent = file.name;
      fileInfoContainer.style.display = 'block';
    } catch (err) {
      showToast(err.message, true);
    }
  }

  removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    urlInput.value = '';
    fileInfoContainer.style.display = 'none';
    previewImg.src = 'https://placehold.co/150?text=Sin+Imagen';
  });

  bindImagePreview(urlInput, previewImg);

  // Cargar datos de edición
  if (categoryId) {
    CategoryRepository.findById(categoryId).then(cat => {
      nameInput.value = cat.nombre;
      document.getElementById('form-descripcion').value = cat.descripcion;
      urlInput.value = cat.urlImagenPortada;
      previewImg.src = resolveImageSrc(cat.urlImagenPortada);
      document.getElementById('form-activo').checked = cat.activo;
      document.getElementById('form-orden').value = cat.orden;
      slugInput.value = cat.slug;

      const isBase64 = cat.urlImagenPortada.startsWith('data:image/');
      if (isBase64) {
        switchTab('upload');
        fileDisplayName.textContent = 'Imagen de portada (Base64)';
        fileInfoContainer.style.display = 'block';
      } else {
        switchTab('url');
      }
    });
  }

  const closeModal = () => modal.remove();
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nombre: nameInput.value.trim(),
      descripcion: document.getElementById('form-descripcion').value.trim(),
      collectionId: collectionSelect.value,
      urlImagenPortada: urlInput.value.trim(),
      activo: document.getElementById('form-activo').checked,
      orden: Number(document.getElementById('form-orden').value) || 1,
      slug: slugInput.value.trim()
    };

    try {
      if (categoryId) {
        await CategoryRepository.update(categoryId, payload);
        showToast('Categoría actualizada con éxito.');
      } else {
        await CategoryRepository.create(payload);
        showToast('Categoría creada con éxito.');
      }
      categoryObserver.notify('category_change', null);
      closeModal();
      await loadCategoriesSection(collectionId);
    } catch (err) {
      showToast(err.message, true);
    }
  });
}

/**
 * Abre el modal de Producto (Crear/Editar)
 */
async function openProductModal(collectionId, categoryId, productId = null) {
  const container = document.getElementById(SELECTORS.modalContainer);

  try {
    const response = await fetch('./partials/productFormModal.html');
    if (!response.ok) throw new Error('No se pudo cargar el modal de producto.');

    container.innerHTML = await response.text();
    setupProductModalElements(collectionId, categoryId, productId);
  } catch (error) {
    showToast(`Error al abrir modal: ${error.message}`, true);
  }
}

function setupProductModalElements(collectionId, categoryId, productId) {
  const modal = document.getElementById('product-modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const form = document.getElementById('product-form');
  
  titleEl.textContent = productId ? 'Editar Producto' : 'Agregar Producto';

  // Mostrar el botón de agregar otro solo si es creación
  const saveAndAddBtn = document.getElementById('modal-save-and-add-btn');
  if (!productId) {
    saveAndAddBtn.style.display = 'block';
  }

  // Seteo de campos básicos
  document.getElementById('form-collection-id').value = collectionId;

  // Llenar select de categorías dinámicamente
  const categorySelect = document.getElementById('form-category-id');
  CategoryRepository.findByCollection(collectionId).then(categories => {
    categorySelect.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
    categorySelect.value = categoryId;
  });

  // Auto-slug
  const nameInput = document.getElementById('form-nombre');
  const slugInput = document.getElementById('form-slug');
  nameInput.addEventListener('input', () => {
    if (!productId) {
      slugInput.value = CategoryModel.prototype.generateSlug(nameInput.value);
    }
  });

  // Calculador automático de precios
  const originalPriceInput = document.getElementById('form-precio-original');
  const discountedPriceInput = document.getElementById('form-precio');
  const discountPercentInput = document.getElementById('form-descuento-porcentaje');

  const updateDiscountPercentage = () => {
    const original = Number(originalPriceInput.value) || 0;
    const discounted = Number(discountedPriceInput.value) || 0;

    if (discounted > original) {
      discountPercentInput.value = 'ERROR: El precio descontado es mayor al original!';
      discountPercentInput.style.color = '#ef4444';
      return;
    }

    discountPercentInput.style.color = 'var(--text-main)';
    if (original > 0 && discounted > 0) {
      const pct = Math.round(((original - discounted) / original) * 100);
      discountPercentInput.value = `${pct}%`;
    } else {
      discountPercentInput.value = '0%';
    }
  };

  originalPriceInput.addEventListener('input', updateDiscountPercentage);
  discountedPriceInput.addEventListener('input', updateDiscountPercentage);

  // Renderizar tallas según estrategia
  const sizesContainer = document.getElementById('sizes-options-container');
  const tempProduct = ProductFactory.create(collectionId, { collectionId });
  const tallasValidas = tempProduct.tallasValidas || [];
  
  sizesContainer.innerHTML = tallasValidas.map(sz => `
    <label class="chip-label" id="chip-size-${sz}">
      <input type="checkbox" name="tallas" value="${sz}"> ${sz}
    </label>
  `).join('');

  // Estilizar checkboxes en forma de chips interactivos
  const setupChipsEvent = (containerId) => {
    document.getElementById(containerId).querySelectorAll('.chip-label').forEach(label => {
      const checkbox = label.querySelector('input');
      
      // Evento de click para sincronizar UI con estado del checkbox
      label.addEventListener('click', (e) => {
        // Prevenir doble disparo
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        label.classList.toggle('active', checkbox.checked);
      });
      
      // Estado inicial
      label.classList.toggle('active', checkbox.checked);
    });
  };

  setupChipsEvent('colors-options-container');
  setupChipsEvent('sizes-options-container');

  // Mostrar campos adicionales según colección
  if (collectionId === 'mujer') {
    document.getElementById('form-extra-fields-mujer').style.display = 'block';
  } else if (collectionId === 'kids') {
    document.getElementById('form-extra-fields-kids').style.display = 'block';
  }

  // Configuración de Imagen Principal
  const tabUploadMain = document.getElementById('btn-tab-upload-main');
  const tabUrlMain = document.getElementById('btn-tab-url-main');
  const contentUploadMain = document.getElementById('tab-content-upload-main');
  const contentUrlMain = document.getElementById('tab-content-url-main');
  
  const urlInput = document.getElementById('form-url-imagen');
  const previewImg = document.getElementById('form-img-preview');
  
  const fileInput = document.getElementById('form-file-input-main');
  const dropzoneArea = document.getElementById('dropzone-area-main');
  const fileInfoContainer = document.getElementById('file-info-container-main');
  const fileDisplayName = document.getElementById('uploaded-file-display-name-main');
  const removeFileBtn = document.getElementById('btn-remove-uploaded-file-main');

  function switchTabMain(mode) {
    if (mode === 'upload') {
      tabUploadMain.classList.add('active');
      tabUrlMain.classList.remove('active');
      contentUploadMain.style.display = 'block';
      contentUrlMain.style.display = 'none';
    } else {
      tabUploadMain.classList.remove('active');
      tabUrlMain.classList.add('active');
      contentUploadMain.style.display = 'none';
      contentUrlMain.style.display = 'block';
    }
  }

  tabUploadMain.addEventListener('click', () => switchTabMain('upload'));
  tabUrlMain.addEventListener('click', () => switchTabMain('url'));
  dropzoneArea.addEventListener('click', () => fileInput.click());

  dropzoneArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzoneArea.classList.add('dragover');
  });

  dropzoneArea.addEventListener('dragleave', () => dropzoneArea.classList.remove('dragover'));

  dropzoneArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzoneArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleMainImageSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleMainImageSelected(e.target.files[0]);
    }
  });

  async function handleMainImageSelected(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Seleccione una imagen válida.', true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('La imagen no debe superar los 2MB.', true);
      return;
    }

    try {
      showToast('Optimizando...');
      const base64 = await compressImage(file);
      urlInput.value = base64;
      previewImg.src = base64;
      fileDisplayName.textContent = file.name;
      fileInfoContainer.style.display = 'block';
    } catch (err) {
      showToast(err.message, true);
    }
  }

  removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    urlInput.value = '';
    fileInfoContainer.style.display = 'none';
    previewImg.src = 'https://placehold.co/150?text=Sin+Imagen';
  });

  bindImagePreview(urlInput, previewImg);

  // Configuración de Galería Adicional (Hasta 4 fotos)
  let galleryImages = [];
  const galleryPreviewsList = document.getElementById('gallery-previews-list');
  const galleryFileInput = document.getElementById('gallery-file-input');

  const renderGalleryPreviews = () => {
    galleryPreviewsList.innerHTML = '';
    galleryImages.forEach((imgSrc, idx) => {
      const gBox = document.createElement('div');
      gBox.className = 'gallery-item-box';
      gBox.innerHTML = `
        <img src="${imgSrc}" class="gallery-img-preview" alt="Foto adicional">
        <button type="button" class="btn-remove-gallery-item" title="Eliminar">&times;</button>
      `;

      gBox.querySelector('.btn-remove-gallery-item').addEventListener('click', () => {
        galleryImages.splice(idx, 1);
        renderGalleryPreviews();
      });

      galleryPreviewsList.appendChild(gBox);
    });
  };

  document.getElementById('btn-add-gallery-photo').addEventListener('click', () => {
    if (galleryImages.length >= 4) {
      showToast('Máximo permitido es de 4 fotos en la galería.', true);
      return;
    }
    galleryFileInput.click();
  });

  galleryFileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        showToast('La foto de galería no debe superar 2MB.', true);
        return;
      }
      try {
        showToast('Optimizando...');
        const base64 = await compressImage(file);
        galleryImages.push(base64);
        renderGalleryPreviews();
      } catch (err) {
        showToast(err.message, true);
      }
    }
    galleryFileInput.value = ''; // Reset input
  });

  // Carga de datos de edición si corresponde
  if (productId) {
    ProductRepository.findById(productId).then(prod => {
      nameInput.value = prod.nombre;
      document.getElementById('form-descripcion').value = prod.descripcion;
      slugInput.value = prod.id; // slug o id
      originalPriceInput.value = prod.precioOriginal;
      discountedPriceInput.value = prod.precio > 0 && prod.precio !== prod.precioOriginal ? prod.precio : '';
      updateDiscountPercentage();

      // Cargar checkboxes colores
      prod.colores.forEach(col => {
        const check = document.querySelector(`input[name="colores"][value="${col}"]`);
        if (check) {
          check.checked = true;
          check.parentElement.classList.add('active');
        }
      });

      // Cargar checkboxes tallas
      prod.tallas.forEach(tl => {
        const check = document.querySelector(`input[name="tallas"][value="${tl}"]`);
        if (check) {
          check.checked = true;
          check.parentElement.classList.add('active');
        }
      });

      // Campos específicos
      if (collectionId === 'mujer' && prod.tipoTela) {
        document.getElementById('form-tipo-tela').value = prod.tipoTela;
      } else if (collectionId === 'kids' && prod.edadRecomendada) {
        document.getElementById('form-edad-recomendada').value = prod.edadRecomendada;
      }

      // Imagen Principal
      urlInput.value = prod.urlImagen;
      previewImg.src = resolveImageSrc(prod.urlImagen);
      const isBase64 = prod.urlImagen.startsWith('data:image/');
      if (isBase64) {
        switchTabMain('upload');
        fileDisplayName.textContent = 'Imagen principal (Base64)';
        fileInfoContainer.style.display = 'block';
      } else {
        switchTabMain('url');
      }

      // Galería
      galleryImages = prod.galeriaImagenes || [];
      renderGalleryPreviews();

      // Configs
      document.getElementById('form-activo').checked = prod.activo;
      document.getElementById('form-destacado').checked = prod.destacado;
      document.getElementById('form-orden').value = prod.orden || 0;
    });
  }

  const closeModal = () => modal.remove();
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

  // Serializar payload de producto
  const getProductPayload = () => {
    const selectedColors = Array.from(document.querySelectorAll('input[name="colores"]:checked')).map(el => el.value);
    const selectedSizes = Array.from(document.querySelectorAll('input[name="tallas"]:checked')).map(el => el.value);
    
    const original = Number(originalPriceInput.value) || 0;
    const discounted = Number(discountedPriceInput.value) || original;

    if (discounted > original) {
      throw new Error('El precio con descuento no puede ser superior al precio original.');
    }

    const payload = {
      nombre: nameInput.value.trim(),
      descripcion: document.getElementById('form-descripcion').value.trim(),
      collectionId: collectionId,
      categoryId: categorySelect.value,
      precioOriginal: original,
      precio: discounted,
      colores: selectedColors,
      tallas: selectedSizes,
      urlImagen: urlInput.value.trim(),
      galeriaImagenes: galleryImages,
      activo: document.getElementById('form-activo').checked,
      destacado: document.getElementById('form-destacado').checked,
      orden: Number(document.getElementById('form-orden').value) || 0
    };

    if (collectionId === 'mujer') {
      payload.tipoTela = document.getElementById('form-tipo-tela').value.trim();
    } else if (collectionId === 'kids') {
      payload.edadRecomendada = document.getElementById('form-edad-recomendada').value.trim();
    }

    return payload;
  };

  // Submit Guardar
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = getProductPayload();
      
      if (productId) {
        await ProductRepository.update(productId, payload);
        showToast('Producto actualizado con éxito.');
      } else {
        await ProductRepository.create(payload);
        showToast('Producto creado con éxito.');
      }
      
      closeModal();
      await loadProductsSection(collectionId, categoryId);
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Guardar y agregar otro
  saveAndAddBtn.addEventListener('click', async () => {
    try {
      const payload = getProductPayload();
      await ProductRepository.create(payload);
      showToast(`Producto "${payload.nombre}" agregado con éxito.`);
      
      // Resetear formulario para el siguiente
      nameInput.value = '';
      document.getElementById('form-descripcion').value = '';
      originalPriceInput.value = '';
      discountedPriceInput.value = '';
      updateDiscountPercentage();

      // Resetear chips
      document.querySelectorAll('input[name="colores"]:checked').forEach(el => {
        el.checked = false;
        el.parentElement.classList.remove('active');
      });
      document.querySelectorAll('input[name="tallas"]:checked').forEach(el => {
        el.checked = false;
        el.parentElement.classList.remove('active');
      });

      // Resetear campos adicionales
      if (collectionId === 'mujer') {
        document.getElementById('form-tipo-tela').value = '';
      } else if (collectionId === 'kids') {
        document.getElementById('form-edad-recomendada').value = '';
      }

      // Resetear imágenes
      fileInput.value = '';
      urlInput.value = '';
      fileInfoContainer.style.display = 'none';
      previewImg.src = 'https://placehold.co/150?text=Sin+Imagen';
      galleryImages = [];
      renderGalleryPreviews();

      document.getElementById('form-destacado').checked = false;
      document.getElementById('form-orden').value = '0';

    } catch (err) {
      showToast(err.message, true);
    }
  });
}
